package com.quickbite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferenceDTO {
    private Long id;
    private Long userId;
    private Boolean emailNotifications;
    private Boolean smsNotifications;
    private Boolean pushNotifications;
    private Boolean orderUpdates;
    private Boolean promotional;
}
