package com.quickbite.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryAgentDTO {

    private Long id;

    private Long userId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[6-9][0-9]{9}$", message = "Phone must be a valid 10-digit number")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Vehicle type is required")
    private String vehicleType; // BIKE, SCOOTER, CAR, BICYCLE

    @NotBlank(message = "Vehicle number is required")
    private String vehicleNumber;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    private String aadharNumber;

    private Boolean isVerified;
    private Boolean isActive;
    private Boolean isOnline;
    private Double currentLatitude;
    private Double currentLongitude;
    private Long totalDeliveries;
    private Double totalEarnings;
    private Double todayEarnings;
    private Integer todayDeliveries;
    private Double averageRating;
    private LocalDateTime createdAt;
}
