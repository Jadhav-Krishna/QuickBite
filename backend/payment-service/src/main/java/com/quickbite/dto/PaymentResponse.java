package com.quickbite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private Long paymentId;
    private Long orderId;
    private String transactionId; // Razorpay payment ID
    private BigDecimal amount;
    private String currency;
    private String status; // PENDING, SUCCESS, FAILED, REFUNDED
    private String paymentMethod;
    private String razorpayOrderId;
    private String razorpaySignature;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
