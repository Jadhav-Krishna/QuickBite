package com.quickbite.service;

import com.quickbite.dto.PaymentRequest;
import com.quickbite.dto.PaymentResponse;
import com.quickbite.entity.*;
import com.quickbite.repository.*;
import com.razorpay.*;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private RazorpayClient razorpayClient;
    @Mock private OrderClient orderClient;
    @Mock private PaymentClient paymentClient;
    @Mock private WalletRepository walletRepository;
    @Mock private WalletStatementRepository walletStatementRepository;

    @InjectMocks private PaymentServiceImpl paymentService;

    private com.quickbite.entity.Payment payment;
    private Wallet wallet;

    @BeforeEach
    void setup() throws Exception {
        payment = com.quickbite.entity.Payment.builder()
                .id(1L)
                .orderId(1L)
                .customerId(1L)
                .amount(100.0)
                .status(PaymentStatus.SUCCESS)
                .transactionId("TXN-1")
                .razorpayOrderId("razor-1")
                .paymentMethod(PaymentMethod.UPI)
                .currency("INR")
                .createdAt(LocalDateTime.now())
                .build();

        wallet = Wallet.builder()
                .id(1L)
                .customerId(1L)
                .balance(new BigDecimal("200"))
                .build();

        ReflectionTestUtils.setField(paymentService, "razorpayKeySecret", "secret");
        ReflectionTestUtils.setField(razorpayClient, "orders", orderClient);
        ReflectionTestUtils.setField(razorpayClient, "payments", paymentClient);
    }

    // ================= INITIATE =================

    @Test
    void initiatePayment_error() {
        PaymentRequest req = new PaymentRequest();
        req.setOrderId(1L);
        req.setCustomerId(1L);
        req.setAmount(new BigDecimal("100"));
        req.setCurrency("INR");

        assertThrows(RuntimeException.class,
                () -> paymentService.initiatePayment(req));
    }

    @Test
    void initiatePayment_success() throws Exception {
        PaymentRequest req = PaymentRequest.builder()
                .orderId(22L)
                .customerId(33L)
                .amount(new BigDecimal("125.50"))
                .currency(" inr ")
                .paymentMethod("card")
                .build();
        Order razorpayOrder = new Order(new JSONObject().put("id", "order_123"));
        when(orderClient.create(any(JSONObject.class))).thenReturn(razorpayOrder);
        when(paymentRepository.save(any())).thenAnswer(invocation -> {
            com.quickbite.entity.Payment saved = invocation.getArgument(0);
            saved.setId(9L);
            return saved;
        });

        PaymentResponse response = paymentService.initiatePayment(req);

        assertEquals(9L, response.getPaymentId());
        assertEquals("order_123", response.getRazorpayOrderId());
        assertEquals("CREDIT_CARD", response.getPaymentMethod());
        assertEquals("PENDING", response.getStatus());
    }

    // ================= VERIFY =================

    @Test
    void verifyPayment_notFound() {
        when(paymentRepository.findByRazorpayOrderId(any()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> paymentService.verifyPayment("p", "sig", "o"));
    }

    @Test
    void verifyPayment_successEvenWhenRazorpayFetchFails() throws Exception {
        payment.setStatus(PaymentStatus.PENDING);
        when(paymentRepository.findByRazorpayOrderId("razor-1"))
                .thenReturn(Optional.of(payment));
        when(paymentClient.fetch("pay_123")).thenThrow(new RuntimeException("Razorpay timeout"));
        when(paymentRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        String signature = signature("razor-1", "pay_123");

        PaymentResponse response = paymentService.verifyPayment("pay_123", signature, "razor-1");

        assertEquals("SUCCESS", response.getStatus());
        assertEquals("pay_123", response.getTransactionId());
        assertEquals("pay_123", payment.getRazorpayPaymentId());
    }

    @Test
    void verifyPayment_badSignatureMarksFailed() {
        payment.setStatus(PaymentStatus.PENDING);
        when(paymentRepository.findByRazorpayOrderId("razor-1"))
                .thenReturn(Optional.of(payment));
        when(paymentRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> paymentService.verifyPayment("pay_123", "bad-signature", "razor-1"));

        assertTrue(exception.getMessage().contains("Payment signature verification failed"));
        assertEquals(PaymentStatus.FAILED, payment.getStatus());
    }

    // ================= FAIL =================

    @Test
    void markPaymentFailed_success() {
        when(paymentRepository.findByRazorpayOrderId(any()))
                .thenReturn(Optional.of(payment));
        when(paymentRepository.save(any())).thenReturn(payment);

        PaymentResponse res =
                paymentService.markPaymentFailed("razor-1", "fail");

        assertEquals("FAILED", res.getStatus());
    }

    @Test
    void markPaymentFailed_usesDefaultReasonWhenBlank() {
        when(paymentRepository.findByRazorpayOrderId(any()))
                .thenReturn(Optional.of(payment));
        when(paymentRepository.save(any())).thenReturn(payment);

        paymentService.markPaymentFailed("razor-1", " ");

        assertEquals("Payment failed", payment.getFailureReason());
    }

    // ================= REFUND =================

    @Test
    void refund_invalidStatus() {
        payment.setStatus(PaymentStatus.FAILED);

        when(paymentRepository.findById(any()))
                .thenReturn(Optional.of(payment));

        assertThrows(RuntimeException.class,
                () -> paymentService.refundPayment(1L, "test"));
    }

    @Test
    void refund_success() throws Exception {
        payment.setStatus(PaymentStatus.SUCCESS);
        when(paymentRepository.findById(any()))
                .thenReturn(Optional.of(payment));
        when(paymentRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentService.refundPayment(1L, "Customer requested");

        assertEquals("REFUNDED", response.getStatus());
        verify(paymentClient).refund(eq("TXN-1"), any(JSONObject.class));
    }

    // ================= WALLET =================

    @Test
    void addToWallet_success() {
        when(walletRepository.findByCustomerId(any()))
                .thenReturn(Optional.of(wallet));
        when(walletRepository.save(any())).thenReturn(wallet);

        var res = paymentService.addToWallet(1L, new BigDecimal("50"));

        assertEquals(new BigDecimal("250"), res.getBalance());
        verify(walletStatementRepository).save(any());
    }

    @Test
    void addToWallet_invalidAmount() {
        assertThrows(RuntimeException.class,
                () -> paymentService.addToWallet(1L, BigDecimal.ZERO));
    }

    @Test
    void payFromWallet_success() {
        when(walletRepository.findByCustomerId(any()))
                .thenReturn(Optional.of(wallet));
        when(walletRepository.save(any())).thenReturn(wallet);
        when(paymentRepository.save(any())).thenReturn(payment);

        PaymentResponse res = paymentService.payFromWallet(1L, 1L);

        assertNotNull(res);
        verify(walletStatementRepository).save(any());
    }

    @Test
    void payFromWallet_insufficientBalance() {
        wallet.setBalance(new BigDecimal("10"));

        when(walletRepository.findByCustomerId(any()))
                .thenReturn(Optional.of(wallet));

        assertThrows(RuntimeException.class,
                () -> paymentService.payFromWallet(1L, 1L));
    }

    // ================= STATUS =================

    @Test
    void updatePaymentStatus_success() {
        when(paymentRepository.findById(any()))
                .thenReturn(Optional.of(payment));
        when(paymentRepository.save(any())).thenReturn(payment);

        paymentService.updatePaymentStatus(1L, "FAILED");

        assertEquals(PaymentStatus.FAILED, payment.getStatus());
    }

    @Test
    void updatePaymentStatus_invalid() {
        when(paymentRepository.findById(any()))
                .thenReturn(Optional.of(payment));

        assertThrows(RuntimeException.class,
                () -> paymentService.updatePaymentStatus(1L, "BAD"));
    }

    // ================= WEBHOOK =================

    @Test
    void webhook_refundEvent() {
        com.quickbite.dto.RazorpayWebhookEvent event = mock(com.quickbite.dto.RazorpayWebhookEvent.class);
        when(event.getEvent()).thenReturn("refund.created");

        paymentService.handleWebhookEvent(event);
    }

    @Test
    void webhook_authorizedEvent() {
        com.quickbite.dto.RazorpayWebhookEvent event = mock(com.quickbite.dto.RazorpayWebhookEvent.class);
        com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload payload = mock(com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload.class);
        com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload.PaymentEntity paymentEntity = mock(com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload.PaymentEntity.class);
        com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload.PaymentEntity.PaymentData entity = mock(com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload.PaymentEntity.PaymentData.class);
        
        when(event.getEvent()).thenReturn("payment.authorized");
        when(event.getPayload()).thenReturn(payload);
        when(payload.getPayment()).thenReturn(paymentEntity);
        when(paymentEntity.getEntity()).thenReturn(entity);
        when(entity.getId()).thenReturn("pay_123");

        paymentService.handleWebhookEvent(event);
    }

    @Test
    void webhook_failedEvent() {
        com.quickbite.dto.RazorpayWebhookEvent event = mock(com.quickbite.dto.RazorpayWebhookEvent.class);
        com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload payload = mock(com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload.class);
        com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload.PaymentEntity paymentEntity = mock(com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload.PaymentEntity.class);
        com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload.PaymentEntity.PaymentData entity = mock(com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload.PaymentEntity.PaymentData.class);
        
        when(event.getEvent()).thenReturn("payment.failed");
        when(event.getPayload()).thenReturn(payload);
        when(payload.getPayment()).thenReturn(paymentEntity);
        when(paymentEntity.getEntity()).thenReturn(entity);
        when(entity.getId()).thenReturn("pay_123");
        when(paymentRepository.findByTransactionId(any())).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any())).thenReturn(payment);

        paymentService.handleWebhookEvent(event);
        
        verify(paymentRepository).save(any());
    }

    @Test
    void webhook_failedEvent_paymentNotFound() {
        com.quickbite.dto.RazorpayWebhookEvent event = mock(com.quickbite.dto.RazorpayWebhookEvent.class);
        com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload payload = mock(com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload.class);
        com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload.PaymentEntity paymentEntity = mock(com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload.PaymentEntity.class);
        com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload.PaymentEntity.PaymentData entity = mock(com.quickbite.dto.RazorpayWebhookEvent.PaymentPayload.PaymentEntity.PaymentData.class);
        
        when(event.getEvent()).thenReturn("payment.failed");
        when(event.getPayload()).thenReturn(payload);
        when(payload.getPayment()).thenReturn(paymentEntity);
        when(paymentEntity.getEntity()).thenReturn(entity);
        when(entity.getId()).thenReturn("pay_123");
        when(paymentRepository.findByTransactionId(any())).thenReturn(Optional.empty());

        paymentService.handleWebhookEvent(event);
    }

    // ================= COD =================

    @Test
    void createCOD_success() {
        when(paymentRepository.save(any())).thenReturn(payment);

        PaymentResponse res =
                paymentService.createCODPayment(1L, 1L, 100.0);

        assertNotNull(res);
    }

    @Test
    void getPaymentByOrderId_success() {
        when(paymentRepository.findByOrderId(any()))
                .thenReturn(Optional.of(payment));

        PaymentResponse res = paymentService.getPaymentByOrderId(1L);

        assertNotNull(res);
        assertEquals(1L, res.getOrderId());
    }

    @Test
    void getPaymentByOrderId_notFound() {
        when(paymentRepository.findByOrderId(any()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> paymentService.getPaymentByOrderId(1L));
    }

    @Test
    void getPaymentsByCustomer_success() {
        when(paymentRepository.findByCustomerId(any()))
                .thenReturn(List.of(payment));

        var res = paymentService.getPaymentsByCustomer(1L);

        assertEquals(1, res.size());
    }

    @Test
    void getAllPayments_success() {
        com.quickbite.entity.Payment olderPayment = com.quickbite.entity.Payment.builder()
                .id(2L)
                .orderId(2L)
                .customerId(1L)
                .amount(50.0)
                .status(PaymentStatus.PENDING)
                .paymentMethod(PaymentMethod.CASH_ON_DELIVERY)
                .transactionId("TXN-2")
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();
        payment.setCreatedAt(LocalDateTime.now());
        when(paymentRepository.findAll())
                .thenReturn(List.of(olderPayment, payment));

        var res = paymentService.getAllPayments();

        assertEquals(2, res.size());
        assertEquals(1L, res.get(0).getPaymentId());
    }

    @Test
    void getWalletBalance_existing() {
        when(walletRepository.findByCustomerId(any()))
                .thenReturn(Optional.of(wallet));

        var res = paymentService.getWalletBalance(1L);

        assertNotNull(res);
        assertEquals(new BigDecimal("200"), res.getBalance());
    }

    @Test
    void getWalletBalance_createNew() {
        when(walletRepository.findByCustomerId(any()))
                .thenReturn(Optional.empty());
        when(walletRepository.save(any())).thenReturn(wallet);

        var res = paymentService.getWalletBalance(1L);

        assertNotNull(res);
        verify(walletRepository).save(any());
    }

    @Test
    void getWalletStatements_success() {
        WalletStatement statement = WalletStatement.builder()
                .id(1L)
                .walletId(1L)
                .type(WalletStatement.TransactionType.DEPOSIT)
                .amount(new BigDecimal("25"))
                .description("Deposit")
                .createdAt(LocalDateTime.now())
                .build();
        when(walletRepository.findByCustomerId(any()))
                .thenReturn(Optional.of(wallet));
        when(walletStatementRepository.findByWalletIdOrderByCreatedAtDesc(any()))
                .thenReturn(List.of(statement));

        var res = paymentService.getWalletStatements(1L);

        assertEquals(1, res.size());
        assertEquals("DEPOSIT", res.get(0).getType());
    }

    @Test
    void getWalletStatements_notFound() {
        when(walletRepository.findByCustomerId(any()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> paymentService.getWalletStatements(1L));
    }

    @Test
    void payAmountFromWallet_success() {
        when(walletRepository.findByCustomerId(any()))
                .thenReturn(Optional.of(wallet));
        when(walletRepository.save(any())).thenReturn(wallet);
        when(paymentRepository.save(any())).thenReturn(payment);

        PaymentResponse res = paymentService.payAmountFromWallet(
            1L, new BigDecimal("50"), "Test payment"
        );

        assertNotNull(res);
        verify(walletStatementRepository).save(any());
    }

    @Test
    void payAmountFromWallet_usesDefaultDescriptionWhenBlank() {
        when(walletRepository.findByCustomerId(any()))
                .thenReturn(Optional.of(wallet));
        when(walletRepository.save(any())).thenReturn(wallet);
        when(paymentRepository.save(any())).thenReturn(payment);

        paymentService.payAmountFromWallet(1L, new BigDecimal("50"), " ");

        ArgumentCaptor<WalletStatement> statementCaptor = ArgumentCaptor.forClass(WalletStatement.class);
        verify(walletStatementRepository).save(statementCaptor.capture());
        assertEquals("Wallet debit", statementCaptor.getValue().getDescription());
    }

    @Test
    void payAmountFromWallet_invalidAmount() {
        assertThrows(RuntimeException.class,
                () -> paymentService.payAmountFromWallet(1L, BigDecimal.ZERO, "test"));
    }

    @Test
    void payAmountFromWallet_insufficientBalance() {
        wallet.setBalance(new BigDecimal("10"));

        when(walletRepository.findByCustomerId(any()))
                .thenReturn(Optional.of(wallet));

        assertThrows(RuntimeException.class,
                () -> paymentService.payAmountFromWallet(1L, new BigDecimal("50"), "test"));
    }

    @Test
    void payAmountFromWallet_walletNotFound() {
        when(walletRepository.findByCustomerId(any()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> paymentService.payAmountFromWallet(1L, new BigDecimal("50"), "test"));
    }

    @Test
    void payFromWallet_notFound() {
        when(walletRepository.findByCustomerId(any()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> paymentService.payFromWallet(1L, 1L));
    }

    @Test
    void refund_notFound() {
        when(paymentRepository.findById(any()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> paymentService.refundPayment(1L, "test"));
    }

    @Test
    void updatePaymentStatus_notFound() {
        when(paymentRepository.findById(any()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> paymentService.updatePaymentStatus(1L, "SUCCESS"));
    }

    @Test
    void markPaymentFailed_notFound() {
        when(paymentRepository.findByRazorpayOrderId(any()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> paymentService.markPaymentFailed("razor-1", "fail"));
    }

    @Test
    void addToWallet_createNew() {
        when(walletRepository.findByCustomerId(any()))
                .thenReturn(Optional.empty());
        when(walletRepository.save(any())).thenReturn(wallet);

        var res = paymentService.addToWallet(1L, new BigDecimal("50"));

        assertNotNull(res);
        verify(walletRepository, times(2)).save(any());
    }

    private String signature(String orderId, String paymentId) throws Exception {
        String payload = orderId + "|" + paymentId;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec("secret".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
    }
}
