package com.quickbite.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${mail.from:noreply@quickbite.com}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String text) {
        log.info("Sending email to {}: subject='{}'", to, subject);
        
        if (mailSender == null) {
            log.warn("JavaMailSender not configured. Skipping email to {}", to);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public void sendHtmlEmail(String to, String subject, String html) {
        log.info("Sending HTML email to {}: subject='{}'", to, subject);

        if (mailSender == null) {
            log.warn("JavaMailSender not configured. Skipping HTML email to {}", to);
            return;
        }

        try {
            var mimeMessage = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(mimeMessage);
            log.info("HTML email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
        }
    }

    public void sendHtmlEmailWithAttachment(
            String to,
            String subject,
            String html,
            String attachmentFilename,
            byte[] attachmentBytes
    ) {
        log.info("Sending HTML email with attachment to {}: subject='{}'", to, subject);

        if (mailSender == null) {
            log.warn("JavaMailSender not configured. Skipping HTML attachment email to {}", to);
            return;
        }

        try {
            var mimeMessage = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            if (attachmentBytes != null && attachmentBytes.length > 0) {
                helper.addAttachment(
                        attachmentFilename != null ? attachmentFilename : "invoice.pdf",
                        new ByteArrayResource(attachmentBytes),
                        "application/pdf"
                );
            }

            mailSender.send(mimeMessage);
            log.info("HTML email with attachment sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send HTML email with attachment to {}: {}", to, e.getMessage());
        }
    }
}
