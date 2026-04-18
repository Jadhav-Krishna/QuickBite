package com.quickbite.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationUpdateDTO {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String accuracy;
    private String address;
    private String status; // IN_TRANSIT, REACHED_RESTAURANT, PICKED_UP, REACHED_CUSTOMER, DELIVERED
}
