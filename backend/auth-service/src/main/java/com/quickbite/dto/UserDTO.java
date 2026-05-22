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
public class UserDTO {
    private Long userId;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private String profilePictureUrl;
    private Boolean isActive;
    private Boolean isEmailVerified;
    private String oauthProvider;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}
