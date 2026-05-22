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
public class RestaurantDTO {
    private Long id;
    private Long ownerId;
    private String name;
    private String cuisineType;
    private String description;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private Double rating;
    private Integer reviewCount;
    private String phoneNumber;
    private String email;
    private String gstNumber;
    private String fssaiLicenseNumber;
    private Double deliveryFee;
    private Double deliveryRadius;
    private Double minOrderAmount;
    private Integer minDeliveryTime;
    private Integer maxDeliveryTime;
    private Integer estimatedDeliveryMin;
    private Boolean isActive;
    private Boolean isOpen;
    private Boolean isApproved;
    private String imageUrl;
    private String openingTime;
    private String closingTime;
    private Set<String> cuisines;
}
