package com.quickbite.controller;

import com.quickbite.entity.Notification;
import com.quickbite.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationController controller;

    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testNotification = Notification.builder()
                .id(1L)
                .userId(1L)
                .title("Test")
                .message("Message")
                .type("INFO")
                .isRead(false)
                .build();
    }

    @Test
    void getUserNotifications_success() {
        when(notificationService.getUserNotifications(1L))
                .thenReturn(Arrays.asList(testNotification));

        ResponseEntity<List<Notification>> response = controller.getUserNotifications(1L);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        verify(notificationService).getUserNotifications(1L);
    }

    @Test
    void getUnreadNotifications_success() {
        when(notificationService.getUnreadNotifications(1L))
                .thenReturn(Arrays.asList(testNotification));

        ResponseEntity<List<Notification>> response = controller.getUnreadNotifications(1L);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        verify(notificationService).getUnreadNotifications(1L);
    }

    @Test
    void getUnreadCount_success() {
        when(notificationService.getUnreadCount(1L)).thenReturn(5L);

        ResponseEntity<Long> response = controller.getUnreadCount(1L);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(5L, response.getBody());
        verify(notificationService).getUnreadCount(1L);
    }

    @Test
    void markAsRead_success() {
        doNothing().when(notificationService).markAsRead(1L);

        ResponseEntity<Void> response = controller.markAsRead(1L);

        assertEquals(200, response.getStatusCodeValue());
        verify(notificationService).markAsRead(1L);
    }

    @Test
    void markAllAsRead_success() {
        doNothing().when(notificationService).markAllAsRead(1L);

        ResponseEntity<Void> response = controller.markAllAsRead(1L);

        assertEquals(200, response.getStatusCodeValue());
        verify(notificationService).markAllAsRead(1L);
    }

    @Test
    void deleteNotification_success() {
        doNothing().when(notificationService).deleteNotification(1L);

        ResponseEntity<Void> response = controller.deleteNotification(1L);

        assertEquals(200, response.getStatusCodeValue());
        verify(notificationService).deleteNotification(1L);
    }

    @Test
    void clearAllNotifications_success() {
        doNothing().when(notificationService).clearAllNotifications(1L);

        ResponseEntity<Void> response = controller.clearAllNotifications(1L);

        assertEquals(200, response.getStatusCodeValue());
        verify(notificationService).clearAllNotifications(1L);
    }
}
