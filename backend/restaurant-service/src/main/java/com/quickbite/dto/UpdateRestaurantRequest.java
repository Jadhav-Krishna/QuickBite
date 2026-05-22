package com.quickbite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateRestaurantRequest {
    private String name;
    private String cuisineType;
    private String description;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private String phoneNumber;
    private String email;
    private Double deliveryFee;
    private Integer minDeliveryTime;
    private Integer maxDeliveryTime;
    private String imageUrl;
    private String openingTime;
    private String closingTime;
    private Boolean isActive;
    private Set<String> cuisines;
}
