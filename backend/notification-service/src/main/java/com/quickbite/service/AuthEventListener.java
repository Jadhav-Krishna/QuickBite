package com.quickbite.service;

import com.quickbite.event.AuthEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class AuthEventListener {

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailTemplateService emailTemplateService;

    @Value("${mail.from:noreply@quickbite.com}")
    private String fromEmail;

    @Value("${mail.admin.email:${mail.from}}")
    private String adminEmail;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @RabbitListener(queues = "auth.login.queue")
    public void handleLoginEvent(AuthEvent event) {
        log.info("Received login event for user: {}", event.getRecipientEmail());
        
        try {
            String timestamp = formatTimestamp(event.getCreatedAt());
            
            // Send email to user
            String userEmailContent = emailTemplateService.generateLoginEmail(
                extractUserName(event.getMessage()),
                event.getRecipientRole(),
                timestamp
            );
            
            emailService.sendHtmlEmail(
                event.getRecipientEmail(),
                "Login Successful - QuickBite",
                userEmailContent
            );
            
            // Send notification to admin
            String adminEmailContent = emailTemplateService.generateAdminNotificationEmail(
                "USER_LOGIN",
                extractUserName(event.getMessage()),
                event.getRecipientEmail(),
                event.getRecipientRole(),
                timestamp
            );
            
            emailService.sendHtmlEmail(
                adminEmail,
                "User Login Notification - QuickBite",
                adminEmailContent
            );
            
            log.info("Login emails sent successfully for user: {}", event.getRecipientEmail());
        } catch (Exception e) {
            log.error("Failed to send login emails for user: {}", event.getRecipientEmail(), e);
        }
    }

    @RabbitListener(queues = "auth.signup.queue")
    public void handleSignupEvent(AuthEvent event) {
        log.info("Received signup event for user: {}", event.getRecipientEmail());
        
        try {
            String timestamp = formatTimestamp(event.getCreatedAt());
            String userName = extractUserName(event.getMessage());
            
            // Send welcome email to user
            String userEmailContent = emailTemplateService.generateSignupEmail(
                userName,
                event.getRecipientRole()
            );
            
            emailService.sendHtmlEmail(
                event.getRecipientEmail(),
                "Welcome to QuickBite! 🍔",
                userEmailContent
            );
            
            // Send notification to admin
            String adminEmailContent = emailTemplateService.generateAdminNotificationEmail(
                "USER_SIGNUP",
                userName,
                event.getRecipientEmail(),
                event.getRecipientRole(),
                timestamp
            );
            
            emailService.sendHtmlEmail(
                adminEmail,
                "New User Signup - QuickBite",
                adminEmailContent
            );
            
            log.info("Signup emails sent successfully for user: {}", event.getRecipientEmail());
        } catch (Exception e) {
            log.error("Failed to send signup emails for user: {}", event.getRecipientEmail(), e);
        }
    }

    @RabbitListener(queues = "auth.password_reset.queue")
    public void handlePasswordResetEvent(AuthEvent event) {
        log.info("Received password reset event for user: {}", event.getRecipientEmail());
        try {
            // Extract reset link from message: "Click the link to reset your password: <url>"
            String resetLink = event.getMessage().contains(": ")
                    ? event.getMessage().substring(event.getMessage().lastIndexOf(": ") + 2).trim()
                    : "";
            String emailContent = emailTemplateService.generatePasswordResetEmail(
                    event.getRecipientEmail(), resetLink);
            emailService.sendHtmlEmail(
                    event.getRecipientEmail(),
                    "Reset Your QuickBite Password",
                    emailContent
            );
            log.info("Password reset email sent to: {}", event.getRecipientEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", event.getRecipientEmail(), e);
        }
    }

    private String extractUserName(String message) {
        // Extract name from messages like "Welcome back, John Doe. You are signed in."
        // or "Welcome John Doe! Your account has been created successfully..."
        try {
            if (message.contains("Welcome back,")) {
                int start = message.indexOf("Welcome back,") + 14;
                int end = message.indexOf(".", start);
                return message.substring(start, end).trim();
            } else if (message.contains("Welcome ")) {
                int start = message.indexOf("Welcome ") + 8;
                int end = message.indexOf("!", start);
                if (end == -1) end = message.indexOf(".", start);
                return message.substring(start, end).trim();
            }
        } catch (Exception e) {
            log.warn("Failed to extract user name from message: {}", message);
        }
        return "User";
    }

    private String formatTimestamp(String timestamp) {
        try {
            LocalDateTime dateTime = LocalDateTime.parse(timestamp);
            return dateTime.format(FORMATTER);
        } catch (Exception e) {
            log.warn("Failed to parse timestamp: {}", timestamp);
            return timestamp;
        }
    }
}
