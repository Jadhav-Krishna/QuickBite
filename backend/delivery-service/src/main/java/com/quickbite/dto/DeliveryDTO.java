package com.quickbite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryDTO {
    private Long id;
    private Long orderId;
    private Long deliveryAgentId;
    private String status;
    private Double pickupLatitude;
    private Double pickupLongitude;
    private Double deliveryLatitude;
    private Double deliveryLongitude;
    private Integer estimatedDeliveryTime;
    private Integer actualDeliveryTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
