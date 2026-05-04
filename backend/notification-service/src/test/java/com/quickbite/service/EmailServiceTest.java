package com.quickbite.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.test.util.ReflectionTestUtils;

import jakarta.mail.internet.MimeMessage;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock private JavaMailSender mailSender;
    @Mock private MimeMessage mimeMessage;

    @InjectMocks private EmailService emailService;

    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@quickbite.com");
    }

    @Test
    void sendEmail_success() {
        emailService.sendEmail("a@mail.com", "sub", "text");

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendEmail_mailSenderNull() {
        emailService = new EmailService();
        emailService.sendEmail("a@mail.com", "sub", "text");
    }

    @Test
    void sendHtmlEmail_success() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendHtmlEmail("a@mail.com", "sub", "<h1>Test</h1>");

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendHtmlEmail_mailSenderNull() {
        emailService = new EmailService();
        emailService.sendHtmlEmail("a@mail.com", "sub", "<h1>Test</h1>");
    }

    @Test
    void sendHtmlEmailWithAttachment_success() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendHtmlEmailWithAttachment(
            "a@mail.com", "sub", "<h1>Test</h1>", "invoice.pdf", new byte[]{1, 2, 3}
        );

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendHtmlEmailWithAttachment_mailSenderNull() {
        emailService = new EmailService();
        emailService.sendHtmlEmailWithAttachment(
            "a@mail.com", "sub", "<h1>Test</h1>", "invoice.pdf", new byte[]{1, 2, 3}
        );
    }
}