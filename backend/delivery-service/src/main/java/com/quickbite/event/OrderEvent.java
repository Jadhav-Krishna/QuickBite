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
}
