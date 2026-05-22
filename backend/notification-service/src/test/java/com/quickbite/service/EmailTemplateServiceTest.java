package com.quickbite.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EmailTemplateServiceTest {

    private final EmailTemplateService service = new EmailTemplateService();

    @Test
    void generateLoginEmail_success() {
        String html = service.generateLoginEmail("John", "CUSTOMER", "01 Jan 2026");

        assertNotNull(html);
        assertTrue(html.contains("John"));
        assertTrue(html.contains("CUSTOMER"));
        assertTrue(html.contains("01 Jan 2026"));
        assertTrue(html.contains("Login Successful"));
    }

    @Test
    void generateSignupEmail_success() {
        String html = service.generateSignupEmail("Jane", "RESTAURANT_OWNER");

        assertNotNull(html);
        assertTrue(html.contains("Jane"));
        assertTrue(html.contains("RESTAURANT_OWNER"));
        assertTrue(html.contains("Welcome to QuickBite"));
    }

    @Test
    void generateAdminNotificationEmail_login() {
        String html = service.generateAdminNotificationEmail(
            "USER_LOGIN", "John", "john@mail.com", "CUSTOMER", "01 Jan 2026"
        );

        assertNotNull(html);
        assertTrue(html.contains("John"));
        assertTrue(html.contains("john@mail.com"));
        assertTrue(html.contains("logged in"));
    }

    @Test
    void generateAdminNotificationEmail_signup() {
        String html = service.generateAdminNotificationEmail(
            "USER_SIGNUP", "Jane", "jane@mail.com", "CUSTOMER", "01 Jan 2026"
        );

        assertNotNull(html);
        assertTrue(html.contains("Jane"));
        assertTrue(html.contains("signed up"));
    }
}
