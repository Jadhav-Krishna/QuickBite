package com.quickbite.service;

import com.quickbite.entity.Notification;
import com.quickbite.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private NotificationService notificationService;

    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testNotification = Notification.builder()
                .id(1L)
                .userId(1L)
                .title("Test Notification")
                .message("Test Message")
                .type("IN_APP")
                .eventType("ORDER_PLACED")
                .isRead(false)
                .build();
    }

    @Test
    void getUserNotifications_Success() {
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(anyLong()))
                .thenReturn(Arrays.asList(testNotification));

        List<Notification> results = notificationService.getUserNotifications(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(notificationRepository).findByUserIdOrderByCreatedAtDesc(1L);
    }

    @Test
    void getUnreadNotifications_Success() {
        when(notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(anyLong()))
                .thenReturn(Arrays.asList(testNotification));

        List<Notification> results = notificationService.getUnreadNotifications(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
    }

    @Test
    void getUnreadCount_Success() {
        when(notificationRepository.countByUserIdAndIsReadFalse(anyLong())).thenReturn(5L);

        Long count = notificationService.getUnreadCount(1L);

        assertEquals(5L, count);
    }

    @Test
    void markAsRead_Success() {
        doNothing().when(notificationRepository).markAsRead(anyLong());

        notificationService.markAsRead(1L);

        verify(notificationRepository).markAsRead(1L);
    }

    @Test
    void deleteNotification_Success() {
        doNothing().when(notificationRepository).deleteById(anyLong());

        notificationService.deleteNotification(1L);

        verify(notificationRepository).deleteById(1L);
    }

    @Test
    void markAllAsRead_Success() {
        doNothing().when(notificationRepository).markAllAsReadByUserId(anyLong());

        notificationService.markAllAsRead(1L);

        verify(notificationRepository).markAllAsReadByUserId(1L);
    }
}
