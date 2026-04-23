package com.quickbite.dto;

import com.quickbite.entity.OrderStatus;
import com.quickbite.entity.PaymentMethod;
import com.quickbite.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private Long id;
    private String orderNumber;
    private Long customerId;
    private Long restaurantId;
    private OrderStatus status;
    private Double totalAmount;
    private Double deliveryCharge;
    private Double discountAmount;
    private Double finalAmount;
    private String deliveryAddress;
    private String customerPhone;
    private String specialInstructions;
    private Long deliveryAgentId;
    private Boolean restaurantPickupConfirmed;
    private LocalDateTime restaurantPickupConfirmedAt;
    private Boolean agentPickupConfirmed;
    private LocalDateTime agentPickupConfirmedAt;
    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime actualDeliveryTime;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private Boolean paymentCompleted;
    private List<OrderItemDTO> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
