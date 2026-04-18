package com.quickbite.service;

import com.quickbite.entity.Notification;
import com.quickbite.event.NotificationEvent;
import com.quickbite.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@Slf4j
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    public void processNotification(NotificationEvent event) {
        log.info("Processing notification event: {}", event.getEventType());

        // 1. Save to database for in-app notification history
        if (event.getUserId() != null || event.getCustomerId() != null) {
            Long userId = event.getUserId() != null ? event.getUserId() : event.getCustomerId();
            
            Notification notification = Notification.builder()
                    .userId(userId)
                    .title(event.getTitle() != null ? event.getTitle() : "New Notification")
                    .message(event.getMessage())
                    .type("IN_APP")
                    .eventType(event.getEventType())
                    .referenceId(event.getOrderId())
                    .isRead(false)
                    .build();
            
            notificationRepository.save(notification);
        }

        // 2. Send Email if recipient email is provided
        if (event.getRecipientEmail() != null && !event.getRecipientEmail().isEmpty()) {
            String subject = event.getTitle() != null ? event.getTitle() : "QuickBite Update";
            emailService.sendEmail(event.getRecipientEmail(), subject, event.getMessage());
        }

        // 3. Send SMS if recipient phone is provided
        if (event.getRecipientPhone() != null && !event.getRecipientPhone().isEmpty()) {
            smsService.sendSms(event.getRecipientPhone(), event.getMessage());
        }
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        });
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }
}
