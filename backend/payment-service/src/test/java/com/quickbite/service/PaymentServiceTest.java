package com.quickbite.service;

import com.quickbite.dto.PaymentDTO;
import com.quickbite.entity.Payment;
import com.quickbite.entity.PaymentMethod;
import com.quickbite.entity.PaymentStatus;
import com.quickbite.repository.PaymentRepository;
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

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Payment testPayment;

    @BeforeEach
    void setUp() {
        testPayment = new Payment();
        testPayment.setId(1L);
        testPayment.setOrderId(1L);
        testPayment.setAmount(new BigDecimal("100.00"));
        testPayment.setPaymentMethod(PaymentMethod.RAZORPAY);
        testPayment.setStatus(PaymentStatus.PENDING);
    }

    @Test
    void getPaymentById_Success() {
        when(paymentRepository.findById(anyLong())).thenReturn(Optional.of(testPayment));

        PaymentDTO result = paymentService.getPaymentById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(paymentRepository).findById(1L);
    }

    @Test
    void getPaymentByOrderId_Success() {
        when(paymentRepository.findByOrderId(anyLong())).thenReturn(Optional.of(testPayment));

        PaymentDTO result = paymentService.getPaymentByOrderId(1L);

        assertNotNull(result);
        assertEquals(1L, result.getOrderId());
    }

    @Test
    void getAllPayments_Success() {
        when(paymentRepository.findAll()).thenReturn(Arrays.asList(testPayment));

        List<PaymentDTO> results = paymentService.getAllPayments();

        assertNotNull(results);
        assertEquals(1, results.size());
    }

    @Test
    void updatePaymentStatus_Success() {
        when(paymentRepository.findById(anyLong())).thenReturn(Optional.of(testPayment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);

        paymentService.updatePaymentStatus(1L, PaymentStatus.SUCCESS);

        assertEquals(PaymentStatus.SUCCESS, testPayment.getStatus());
        verify(paymentRepository).save(testPayment);
    }

    @Test
    void createCODPayment_Success() {
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);

        PaymentDTO result = paymentService.createCODPayment(1L, new BigDecimal("100.00"));

        assertNotNull(result);
        verify(paymentRepository).save(any(Payment.class));
    }
}
