package com.quickbite.dto;

import com.quickbite.entity.PaymentMethod;
import com.quickbite.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO {
    private Long id;
    private String transactionId;
    private Long orderId;
    private Long customerId;
    private Double amount;
    private PaymentStatus status;
    private PaymentMethod paymentMethod;
    private String razorpayPaymentId;
    private String razorpayOrderId;
    private String razorpaySignature;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
