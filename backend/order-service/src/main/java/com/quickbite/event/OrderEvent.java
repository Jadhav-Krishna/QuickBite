package com.quickbite.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private String eventId;
    private String eventType;
    private Long orderId;
    private String orderNumber;
    private Long customerId;
    private Long restaurantId;
    private String orderStatus;
    private Double totalAmount;
    private String paymentMethod;
    private LocalDateTime timestamp;
    private String message;

    public enum EventType {
        ORDER_PLACED,
        ORDER_CONFIRMED,
        ORDER_PREPARING,
        ORDER_READY,
        ORDER_PICKED_UP,
        ORDER_IN_TRANSIT,
        ORDER_DELIVERED,
        ORDER_CANCELLED,
        PAYMENT_INITIATED,
        PAYMENT_SUCCESS,
        PAYMENT_FAILED
    }
}
