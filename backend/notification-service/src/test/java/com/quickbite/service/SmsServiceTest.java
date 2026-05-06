package com.quickbite.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SmsServiceTest {

    private final SmsService smsService = new SmsService();

    @Test
    void sendSms_notConfigured() {
        // Should not throw exception when SMS service is not configured
        assertDoesNotThrow(() -> smsService.sendSms("+911234567890", "Test"));
    }
}