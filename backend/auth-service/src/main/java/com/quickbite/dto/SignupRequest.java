package com.quickbite.dto;

import com.quickbite.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone number should be valid")
    private String phone;

    @NotBlank(message = "User role is required")
    private String role; // CUSTOMER, RESTAURANT_OWNER, DELIVERY_AGENT

    private String restaurantName; // Only for RESTAURANT_OWNER
    private String restaurantAddress; // Only for RESTAURANT_OWNER
}
