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
public class NotificationEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String eventId;
    private String eventType; // ORDER_PLACED, ORDER_CONFIRMED, PAYMENT_SUCCESS, DELIVERY_STARTED, etc.
    private Long orderId;
    private Long userId;
    private Long customerId;
    private Long restaurantId;
    private Long deliveryAgentId;
    private String title;
    private String message;
    private String notificationType; // IN_APP, EMAIL, SMS
    private String recipientEmail;
    private String recipientPhone;
    private String recipientRole; // CUSTOMER, OWNER, AGENT, ADMIN
    private LocalDateTime createdAt;
    private String deepLink; // For mobile app navigation
    private boolean isRead;
}
