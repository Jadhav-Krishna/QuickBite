package com.quickbite.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthEvent implements Serializable {
    private String eventType;
    private Long userId;
    private String title;
    private String message;
    private String notificationType;
    private String recipientEmail;
    private String recipientRole;
    private String createdAt;
}
