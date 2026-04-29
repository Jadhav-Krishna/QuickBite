package com.quickbite.service;

import com.quickbite.config.RabbitMQConfig;
import com.quickbite.entity.Notification;
import com.quickbite.event.NotificationEvent;
import com.quickbite.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void processNotification(Map<String, Object> event) {
        log.info("Received notification event: {}", event);
        
        try {
            Long userId = getLong(event.get("userId"));
            String title = getString(event.get("title"));
            String message = getString(event.get("message"));
            String type = getString(event.get("type"));
            String eventType = getString(event.get("eventType"));
            Long referenceId = getLong(event.get("referenceId"));
            Boolean sendEmail = getBoolean(event.get("sendEmail"));
            String email = getString(event.get("email"));
            
            // Save notification to database
            Notification notification = Notification.builder()
                    .userId(userId)
                    .title(title)
                    .message(message)
                    .type(type != null ? type : "INFO")
                    .eventType(eventType != null ? eventType : "GENERAL")
                    .referenceId(referenceId)
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            
            notificationRepository.save(notification);
            log.info("Notification saved to database for user: {}", userId);
            
            // Send email if required
            if (Boolean.TRUE.equals(sendEmail) && email != null && mailSender != null) {
                sendEmail(email, title, message);
            }
            
        } catch (Exception e) {
            log.error("Error processing notification: {}", e.getMessage(), e);
        }
    }
    
    private void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage(), e);
        }
    }
    
    public List<Notification> getUserNotifications(Long userId) {
        log.info("Fetching notifications for user: {}", userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public List<Notification> getUnreadNotifications(Long userId) {
        log.info("Fetching unread notifications for user: {}", userId);
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }
    
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    @Transactional
    public void markAsRead(Long notificationId) {
        log.info("Marking notification as read: {}", notificationId);
        notificationRepository.markAsRead(notificationId);
    }
    
    @Transactional
    public void markAllAsRead(Long userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        notificationRepository.markAllAsReadByUserId(userId);
    }
    
    @Transactional
    public void deleteNotification(Long notificationId) {
        log.info("Deleting notification: {}", notificationId);
        notificationRepository.deleteById(notificationId);
    }
    
    @Transactional
    public void clearAllNotifications(Long userId) {
        log.info("Clearing all notifications for user: {}", userId);
        notificationRepository.deleteByUserId(userId);
    }
    
    private Long getLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).longValue();
        try {
            return Long.parseLong(value.toString());
        } catch (Exception e) {
            return null;
        }
    }
    
    private String getString(Object value) {
        return value != null ? value.toString() : null;
    }
    
    private Boolean getBoolean(Object value) {
        if (value == null) return false;
        if (value instanceof Boolean) return (Boolean) value;
        return Boolean.parseBoolean(value.toString());
    }
}
