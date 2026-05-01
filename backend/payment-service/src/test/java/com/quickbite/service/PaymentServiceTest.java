package com.quickbite.service;

import com.quickbite.dto.PaymentResponse;
import com.quickbite.entity.Payment;
import com.quickbite.entity.PaymentMethod;
import com.quickbite.entity.PaymentStatus;
import com.quickbite.repository.PaymentRepository;
import com.quickbite.repository.WalletRepository;
import com.quickbite.repository.WalletStatementRepository;
import com.razorpay.RazorpayClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private RazorpayClient razorpayClient;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletStatementRepository walletStatementRepository;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Payment testPayment;

    @BeforeEach
    void setUp() {
        testPayment = Payment.builder()
                .id(1L)
                .orderId(1L)
                .customerId(1L)
                .amount(100.0)
                .paymentMethod(PaymentMethod.UPI)
                .status(PaymentStatus.PENDING)
                .transactionId("TXN-001")
                .build();
    }

    @Test
    void getPaymentByOrderId_Success() {
        when(paymentRepository.findByOrderId(anyLong())).thenReturn(Optional.of(testPayment));

        PaymentResponse result = paymentService.getPaymentByOrderId(1L);

        assertNotNull(result);
        assertEquals(1L, result.getOrderId());
    }

    @Test
    void getAllPayments_Success() {
        when(paymentRepository.findAll()).thenReturn(Arrays.asList(testPayment));

        List<PaymentResponse> results = paymentService.getAllPayments();

        assertNotNull(results);
        assertEquals(1, results.size());
    }

    @Test
    void updatePaymentStatus_Success() {
        when(paymentRepository.findById(anyLong())).thenReturn(Optional.of(testPayment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);

        paymentService.updatePaymentStatus(1L, "SUCCESS");

        assertEquals(PaymentStatus.SUCCESS, testPayment.getStatus());
        verify(paymentRepository).save(testPayment);
    }

    @Test
    void createCODPayment_Success() {
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);

        PaymentResponse result = paymentService.createCODPayment(1L, 1L, 100.0);

        assertNotNull(result);
        verify(paymentRepository).save(any(Payment.class));
    }
}
