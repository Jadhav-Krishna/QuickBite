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
public class DeliveryStatusEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private String eventId;
    private Long orderId;
    private String orderNumber;
    private String eventType;
    private String orderStatus;
    private String message;
    private LocalDateTime timestamp;
}
