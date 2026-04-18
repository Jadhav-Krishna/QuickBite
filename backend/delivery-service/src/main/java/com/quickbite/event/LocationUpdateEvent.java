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
public class LocationUpdateEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String eventId;
    private Long deliveryAgentId;
    private Long orderId;
    private Double latitude;
    private Double longitude;
    private String accuracy;
    private LocalDateTime timestamp;
    private String address;
    private String status; // IN_TRANSIT, REACHED_RESTAURANT, PICKED_UP, REACHED_CUSTOMER, DELIVERED
}
