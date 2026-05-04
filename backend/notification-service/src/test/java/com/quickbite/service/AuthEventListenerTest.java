package com.quickbite.service;

import com.quickbite.event.AuthEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthEventListenerTest {

    @Mock private EmailService emailService;
    @Mock private EmailTemplateService templateService;

    @InjectMocks private AuthEventListener listener;

    private AuthEvent event;

    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(listener, "fromEmail", "noreply@quickbite.com");
        ReflectionTestUtils.setField(listener, "adminEmail", "admin@quickbite.com");

        event = AuthEvent.builder()
                .recipientEmail("user@mail.com")
                .recipientRole("CUSTOMER")
                .message("Welcome back, Krishna. You are signed in.")
                .createdAt("2026-01-01T10:00:00")
                .build();
    }

    @Test
    void handleLoginEvent_success() {
        when(templateService.generateLoginEmail(any(), any(), any()))
                .thenReturn("html");
        when(templateService.generateAdminNotificationEmail(any(), any(), any(), any(), any()))
                .thenReturn("adminHtml");

        listener.handleLoginEvent(event);

        verify(emailService, times(2)).sendHtmlEmail(any(), any(), any());
    }

    @Test
    void handleSignupEvent_success() {
        when(templateService.generateSignupEmail(any(), any()))
                .thenReturn("signupHtml");
        when(templateService.generateAdminNotificationEmail(any(), any(), any(), any(), any()))
                .thenReturn("adminHtml");

        listener.handleSignupEvent(event);

        verify(emailService, times(2)).sendHtmlEmail(any(), any(), any());
    }

    @Test
    void handleLoginEvent_emailFailure() {
        doThrow(new RuntimeException("Email failed"))
            .when(emailService).sendHtmlEmail(any(), any(), any());

        listener.handleLoginEvent(event);

        verify(emailService).sendHtmlEmail(any(), any(), any());
    }

    @Test
    void handleSignupEvent_withWelcomeMessage() {
        when(templateService.generateSignupEmail(any(), any()))
                .thenReturn("signupHtml");
        when(templateService.generateAdminNotificationEmail(any(), any(), any(), any(), any()))
                .thenReturn("adminHtml");

        AuthEvent signupEvent = AuthEvent.builder()
                .recipientEmail("new@mail.com")
                .recipientRole("CUSTOMER")
                .message("Welcome John Doe! Your account has been created.")
                .createdAt("2026-01-01T10:00:00")
                .build();

        listener.handleSignupEvent(signupEvent);

        verify(emailService, times(2)).sendHtmlEmail(any(), any(), any());
    }
}