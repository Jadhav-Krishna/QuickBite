package com.quickbite.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class PaymentEntityTest {

    @Test
    void paymentLifecycleCallbacksSetTimestamps() {
        Payment payment = Payment.builder()
                .id(1L)
                .transactionId("TXN-1")
                .orderId(10L)
                .customerId(20L)
                .amount(100.0)
                .status(PaymentStatus.PENDING)
                .paymentMethod(PaymentMethod.UPI)
                .build();

        payment.onCreate();
        LocalDateTime createdAt = payment.getCreatedAt();

        assertEquals("INR", payment.getCurrency());
        assertNotNull(createdAt);
        assertNotNull(payment.getUpdatedAt());

        payment.onUpdate();

        assertEquals(createdAt, payment.getCreatedAt());
        assertNotNull(payment.getUpdatedAt());
    }
}
