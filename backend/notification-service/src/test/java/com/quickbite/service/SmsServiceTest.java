package com.quickbite.service;

import org.junit.jupiter.api.Test;

class SmsServiceTest {

    private final SmsService smsService = new SmsService();

    @Test
    void sendSms_notConfigured() {
        smsService.sendSms("+911234567890", "Test");
    }
}