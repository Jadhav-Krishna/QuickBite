package com.quickbite.service;

import com.quickbite.dto.NotificationDTO;
import com.quickbite.entity.Notification;
import com.quickbite.entity.NotificationType;
import com.quickbite.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testNotification = new Notification();
        testNotification.setId(1L);
        testNotification.setUserId(1L);
        testNotification.setTitle("Test Notification");
        testNotification.setMessage("Test Message");
        testNotification.setType(NotificationType.IN_APP);
        testNotification.setIsRead(false);
    }

    @Test
    void getNotificationById_Success() {
        when(notificationRepository.findById(anyLong())).thenReturn(Optional.of(testNotification));

        NotificationDTO result = notificationService.getNotificationById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(notificationRepository).findById(1L);
    }

    @Test
    void getUserNotifications_Success() {
        when(notificationRepository.findByUserId(anyLong())).thenReturn(Arrays.asList(testNotification));

        List<NotificationDTO> results = notificationService.getUserNotifications(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
    }

    @Test
    void createNotification_Success() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        NotificationDTO dto = new NotificationDTO();
        dto.setUserId(1L);
        dto.setTitle("New Notification");
        dto.setMessage("New Message");

        NotificationDTO result = notificationService.createNotification(dto);

        assertNotNull(result);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void markAsRead_Success() {
        when(notificationRepository.findById(anyLong())).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        notificationService.markAsRead(1L);

        verify(notificationRepository).save(argThat(Notification::getIsRead));
    }

    @Test
    void getUnreadCount_Success() {
        when(notificationRepository.countByUserIdAndIsRead(anyLong(), anyBoolean())).thenReturn(5L);

        Long count = notificationService.getUnreadCount(1L);

        assertEquals(5L, count);
    }

    @Test
    void deleteNotification_Success() {
        when(notificationRepository.existsById(anyLong())).thenReturn(true);
        doNothing().when(notificationRepository).deleteById(anyLong());

        notificationService.deleteNotification(1L);

        verify(notificationRepository).deleteById(1L);
    }
}
