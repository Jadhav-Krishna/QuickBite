package com.quickbite.dto;

import com.quickbite.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    @Email(message = "Please enter a valid email address")
    @NotBlank(message = "Email is required")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s'-]+$", message = "Full name can only contain letters, spaces, hyphens, and apostrophes")
    private String fullName;

    @Pattern(
        regexp = "^(\\+91[6-9]\\d{9}|[6-9]\\d{9})$",
        message = "Phone number must be a valid Indian mobile number (10 digits starting with 6-9, or with +91 prefix)"
    )
    private String phone;

    @NotBlank(message = "User role is required")
    private String role; // CUSTOMER, RESTAURANT_OWNER, DELIVERY_AGENT

    private String restaurantName; // Only for RESTAURANT_OWNER
    private String restaurantAddress; // Only for RESTAURANT_OWNER
}
