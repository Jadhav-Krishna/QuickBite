package com.quickbite.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OAuth2LoginRequest {

    @NotBlank(message = "Provider is required")
    private String provider; // GOOGLE or GITHUB

    @NotBlank(message = "Token is required")
    private String token;

    private String role; // Optional - if provided, used during registration
}
