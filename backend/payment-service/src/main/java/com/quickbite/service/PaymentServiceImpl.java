package com.quickbite.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.quickbite.dto.PaymentRequest;
import com.quickbite.dto.PaymentResponse;
import com.quickbite.dto.RazorpayWebhookEvent;
import com.quickbite.entity.*;
import com.quickbite.repository.PaymentRepository;
import com.quickbite.repository.WalletRepository;
import com.quickbite.repository.WalletStatementRepository;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private RazorpayClient razorpayClient;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletStatementRepository walletStatementRepository;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Override
    public PaymentResponse initiatePayment(PaymentRequest request) {
        try {
            log.info("Initiating payment for order: {}", request.getOrderId());

            // Create Razorpay order
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", request.getAmount().multiply(new BigDecimal("100")).intValue()); // Convert to paise
            orderRequest.put("currency", request.getCurrency());
            orderRequest.put("receipt", "order_" + request.getOrderId());
            orderRequest.put("payment_capture", 1);

            Order razorpayOrder = razorpayClient.orders.create(orderRequest);
                String razorpayOrderId = razorpayOrder.get("id").toString();

            // Save payment record
            Payment payment = Payment.builder()
                    .orderId(request.getOrderId())
                    .customerId(request.getCustomerId())
                    .amount(request.getAmount().doubleValue())
                    // `transactionId` is non-null in DB schema; use Razorpay order id until payment is captured.
                    .transactionId(razorpayOrderId)
                    .currency(request.getCurrency().trim().toUpperCase())
                    .paymentMethod(mapPaymentMethod(request.getPaymentMethod()))
                    .status(PaymentStatus.PENDING)
                    .razorpayOrderId(razorpayOrderId)
                    .createdAt(LocalDateTime.now())
                    .build();

            Payment savedPayment = paymentRepository.save(payment);

            log.info("Payment initiated with Razorpay order: {}", razorpayOrderId);

            return mapToResponse(savedPayment);
        } catch (Exception e) {
            log.error("Failed to initiate payment", e);
            throw new RuntimeException("Payment initiation failed: " + e.getMessage());
        }
    }

    @Override
    public PaymentResponse verifyPayment(String paymentId, String signature, String orderId) {
        try {
            log.info("Verifying payment: {}", paymentId);

            Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(orderId);
            if (paymentOpt.isEmpty()) {
                throw new RuntimeException("Payment not found for order: " + orderId);
            }

            Payment payment = paymentOpt.get();

            // Verify Razorpay signature
            if (verifyRazorpaySignature(orderId, paymentId, signature)) {
                razorpayClient.payments.fetch(paymentId);

                payment.setTransactionId(paymentId);
                payment.setRazorpayPaymentId(paymentId);
                payment.setRazorpaySignature(signature);
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setUpdatedAt(LocalDateTime.now());

                Payment savedPayment = paymentRepository.save(payment);
                log.info("Payment verified successfully: {}", paymentId);

                return mapToResponse(savedPayment);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setUpdatedAt(LocalDateTime.now());
                paymentRepository.save(payment);

                throw new RuntimeException("Payment signature verification failed");
            }
        } catch (Exception e) {
            log.error("Payment verification failed", e);
            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }
    }

    @Override
    public PaymentResponse markPaymentFailed(String razorpayOrderId, String reason) {
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for Razorpay order: " + razorpayOrderId));

        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(reason != null && !reason.isBlank() ? reason : "Payment failed");
        payment.setUpdatedAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);
        return mapToResponse(savedPayment);
    }

    @Override
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order: " + orderId));
        return mapToResponse(payment);
    }

    @Override
    public PaymentResponse refundPayment(Long paymentId, String reason) {
        try {
            log.info("Processing refund for payment: {}", paymentId);

            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            if (!payment.getStatus().equals(PaymentStatus.SUCCESS)) {
                throw new RuntimeException("Only successful payments can be refunded");
            }

            // Create Razorpay refund
            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", BigDecimal.valueOf(payment.getAmount()).multiply(new BigDecimal("100")).intValue());
            refundRequest.put("notes", reason);

            razorpayClient.payments.refund(payment.getTransactionId(), refundRequest);

            payment.setStatus(PaymentStatus.REFUNDED);
            payment.setUpdatedAt(LocalDateTime.now());

            Payment savedPayment = paymentRepository.save(payment);
            log.info("Refund processed for payment: {}", paymentId);

            return mapToResponse(savedPayment);
        } catch (Exception e) {
            log.error("Refund processing failed", e);
            throw new RuntimeException("Refund processing failed: " + e.getMessage());
        }
    }

    @Override
    public void handleWebhookEvent(RazorpayWebhookEvent event) {
        try {
            log.info("Processing webhook event: {}", event.getEvent());

            if ("payment.authorized".equals(event.getEvent())) {
                // Handle authorized payment
                String paymentId = event.getPayload().getPayment().getEntity().getId();
                log.info("Payment authorized: {}", paymentId);
            } else if ("payment.failed".equals(event.getEvent())) {
                // Handle failed payment
                String paymentId = event.getPayload().getPayment().getEntity().getId();
                log.warn("Payment failed: {}", paymentId);

                // Update payment status
                paymentRepository.findByTransactionId(paymentId).ifPresent(payment -> {
                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setUpdatedAt(LocalDateTime.now());
                    paymentRepository.save(payment);
                });
            } else if ("refund.created".equals(event.getEvent())) {
                // Handle refund created
                log.info("Refund created event received");
            }
        } catch (Exception e) {
            log.error("Error handling webhook event", e);
        }
    }

    // ==================== Wallet Operations ====================

    @Override
    public com.quickbite.dto.WalletResponse getWalletBalance(Long customerId) {
        Wallet wallet = walletRepository.findByCustomerId(customerId)
                .orElseGet(() -> createWallet(customerId));
        return mapToWalletResponse(wallet);
    }

    @Override
    public com.quickbite.dto.WalletResponse addToWallet(Long customerId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount must be greater than zero");
        }

        Wallet wallet = walletRepository.findByCustomerId(customerId)
                .orElseGet(() -> createWallet(customerId));

        wallet.setBalance(wallet.getBalance().add(amount));
        Wallet savedWallet = walletRepository.save(wallet);

        // Add statement
        WalletStatement statement = WalletStatement.builder()
                .walletId(savedWallet.getId())
                .type(WalletStatement.TransactionType.DEPOSIT)
                .amount(amount)
                .description("Added to wallet via payment gateway")
                .build();
        walletStatementRepository.save(statement);

        return mapToWalletResponse(savedWallet);
    }

    @Override
    public PaymentResponse payAmountFromWallet(Long customerId, BigDecimal amount, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount must be greater than zero");
        }

        Wallet wallet = walletRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient wallet balance");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        WalletStatement statement = WalletStatement.builder()
                .walletId(wallet.getId())
                .type(WalletStatement.TransactionType.DEBIT)
                .amount(amount)
                .description(description != null && !description.isBlank() ? description : "Wallet debit")
                .build();
        walletStatementRepository.save(statement);

        Payment payment = Payment.builder()
                .orderId(-System.currentTimeMillis())
                .customerId(customerId)
                .amount(amount.doubleValue())
                .paymentMethod(PaymentMethod.WALLET)
                .status(PaymentStatus.SUCCESS)
                .transactionId("WALLET-" + System.currentTimeMillis())
                .createdAt(LocalDateTime.now())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        return mapToResponse(savedPayment);
    }

    @Override
    public PaymentResponse payFromWallet(Long customerId, Long orderId) {
        // Find order amount from DB ideally. Here we just mock an amount.
        BigDecimal orderAmount = BigDecimal.valueOf(100.0); // Mock for now

        Wallet wallet = walletRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (wallet.getBalance().compareTo(orderAmount) < 0) {
            throw new RuntimeException("Insufficient wallet balance");
        }

        wallet.setBalance(wallet.getBalance().subtract(orderAmount));
        walletRepository.save(wallet);

        // Add statement
        WalletStatement statement = WalletStatement.builder()
                .walletId(wallet.getId())
                .type(WalletStatement.TransactionType.DEBIT)
                .amount(orderAmount)
                .description("Paid for order: " + orderId)
                .build();
        walletStatementRepository.save(statement);

        Payment payment = Payment.builder()
                .orderId(orderId)
                .customerId(customerId)
                .amount(orderAmount.doubleValue())
                .paymentMethod(PaymentMethod.WALLET)
                .status(PaymentStatus.SUCCESS)
                .transactionId("WALLET-" + System.currentTimeMillis())
                .createdAt(LocalDateTime.now())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        return mapToResponse(savedPayment);
    }

    @Override
    public java.util.List<com.quickbite.dto.WalletStatementDTO> getWalletStatements(Long customerId) {
        Wallet wallet = walletRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        return walletStatementRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId()).stream()
                .map(this::mapToWalletStatementDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public java.util.List<PaymentResponse> getPaymentsByCustomer(Long customerId) {
        return paymentRepository.findByCustomerId(customerId).stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .sorted(Comparator.comparing(Payment::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public PaymentResponse updatePaymentStatus(Long paymentId, String status) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));

        try {
            PaymentStatus newStatus = PaymentStatus.valueOf(status.toUpperCase());
            payment.setStatus(newStatus);
            payment.setUpdatedAt(LocalDateTime.now());
            Payment savedPayment = paymentRepository.save(payment);
            log.info("Payment status updated to {} for payment: {}", newStatus, paymentId);
            return mapToResponse(savedPayment);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid payment status: " + status);
        }
    }

    private Wallet createWallet(Long customerId) {
        Wallet wallet = Wallet.builder()
                .customerId(customerId)
                .balance(BigDecimal.ZERO)
                .build();
        return walletRepository.save(wallet);
    }

    private com.quickbite.dto.WalletResponse mapToWalletResponse(Wallet wallet) {
        return com.quickbite.dto.WalletResponse.builder()
                .walletId(wallet.getId())
                .customerId(wallet.getCustomerId())
                .balance(wallet.getBalance())
                .build();
    }

    private com.quickbite.dto.WalletStatementDTO mapToWalletStatementDTO(WalletStatement statement) {
        return com.quickbite.dto.WalletStatementDTO.builder()
                .id(statement.getId())
                .walletId(statement.getWalletId())
                .type(statement.getType().name())
                .amount(statement.getAmount())
                .description(statement.getDescription())
                .createdAt(statement.getCreatedAt())
                .build();
    }

    private boolean verifyRazorpaySignature(String orderId, String paymentId, String signature) throws Exception {
        String payload = orderId + "|" + paymentId;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        String generatedSignature = HexFormat.of().formatHex(hash);
        return generatedSignature.equals(signature);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .customerId(payment.getCustomerId())
                .transactionId(payment.getTransactionId())
                .amount(BigDecimal.valueOf(payment.getAmount()))
                .currency("INR")
                .status(payment.getStatus().name())
                .paymentMethod(payment.getPaymentMethod().name())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpaySignature(payment.getRazorpaySignature())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }

    private PaymentMethod mapPaymentMethod(String paymentMethod) {
        if (paymentMethod == null) {
            return PaymentMethod.UPI;
        }
        return switch (paymentMethod.trim().toUpperCase()) {
            case "CARD", "CREDIT_CARD" -> PaymentMethod.CREDIT_CARD;
            case "DEBIT_CARD" -> PaymentMethod.DEBIT_CARD;
            case "UPI" -> PaymentMethod.UPI;
            case "WALLET" -> PaymentMethod.WALLET;
            case "NET_BANKING", "NETBANKING" -> PaymentMethod.NET_BANKING;
            case "COD", "CASH_ON_DELIVERY" -> PaymentMethod.CASH_ON_DELIVERY;
            default -> PaymentMethod.UPI;
        };
    }
}
