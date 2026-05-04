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

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private RazorpayClient razorpayClient;
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
                .build();

        wallet = Wallet.builder()
                .id(1L)
                .customerId(1L)
                .balance(new BigDecimal("200"))
                .build();
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

    // ================= VERIFY =================

    @Test
    void verifyPayment_notFound() {
        when(paymentRepository.findByRazorpayOrderId(any()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> paymentService.verifyPayment("p", "sig", "o"));
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

    // ================= REFUND =================

    @Test
    void refund_invalidStatus() {
        payment.setStatus(PaymentStatus.FAILED);

        when(paymentRepository.findById(any()))
                .thenReturn(Optional.of(payment));

        assertThrows(RuntimeException.class,
                () -> paymentService.refundPayment(1L, "test"));
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
        when(paymentRepository.findAll())
                .thenReturn(List.of(payment));

        var res = paymentService.getAllPayments();

        assertEquals(1, res.size());
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
        when(walletRepository.findByCustomerId(any()))
                .thenReturn(Optional.of(wallet));
        when(walletStatementRepository.findByWalletIdOrderByCreatedAtDesc(any()))
                .thenReturn(List.of());

        var res = paymentService.getWalletStatements(1L);

        assertNotNull(res);
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
}