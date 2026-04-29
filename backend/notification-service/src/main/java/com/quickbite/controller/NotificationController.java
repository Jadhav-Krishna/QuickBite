package com.quickbite.controller;

import com.quickbite.entity.Notification;
import com.quickbite.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@Slf4j
@CrossOrigin(origins = "*")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable("userId") Long userId) {
        log.info("GET request for user notifications: {}", userId);
        List<Notification> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable("userId") Long userId) {
        log.info("GET request for unread notifications: {}", userId);
        List<Notification> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/user/{userId}/unread/count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable("userId") Long userId) {
        log.info("GET request for unread count: {}", userId);
        Long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(count);
    }
    
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable("notificationId") Long notificationId) {
        log.info("PUT request to mark notification as read: {}", notificationId);
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable("userId") Long userId) {
        log.info("PUT request to mark all notifications as read for user: {}", userId);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable("notificationId") Long notificationId) {
        log.info("DELETE request for notification: {}", notificationId);
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> clearAllNotifications(@PathVariable("userId") Long userId) {
        log.info("DELETE request to clear all notifications for user: {}", userId);
        notificationService.clearAllNotifications(userId);
        return ResponseEntity.ok().build();
    }
}
