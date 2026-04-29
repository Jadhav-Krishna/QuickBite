package com.quickbite.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRestaurantRequest {
    @NotNull(message = "Owner ID is required")
    private Long ownerId;
    
    @NotBlank(message = "Restaurant name is required")
    private String name;
    
    @NotBlank(message = "Cuisine type is required")
    private String cuisineType;
    
    private String description;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    @NotBlank(message = "City is required")
    private String city;
    
    @NotBlank(message = "State is required")
    private String state;
    
    @NotBlank(message = "Pincode is required")
    private String pincode;
    
    @NotNull(message = "Latitude is required")
    private Double latitude;
    
    @NotNull(message = "Longitude is required")
    private Double longitude;
    
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    private Double deliveryFee;
    private Integer minDeliveryTime;
    private Integer maxDeliveryTime;
    private String imageUrl;
    private String openingTime;
    private String closingTime;
    private Set<String> cuisines;
}
