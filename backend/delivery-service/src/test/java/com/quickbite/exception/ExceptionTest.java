package com.quickbite.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ExceptionTest {

    @Test
    void deliveryAgentNotFoundException_withMessage() {
        DeliveryAgentNotFoundException ex = new DeliveryAgentNotFoundException("Agent not found");

        assertEquals("Agent not found", ex.getMessage());
    }

    @Test
    void locationUpdateException_withMessage() {
        LocationUpdateException ex = new LocationUpdateException("Location update failed");

        assertEquals("Location update failed", ex.getMessage());
    }

    @Test
    void locationUpdateException_withCause() {
        Throwable cause = new RuntimeException("Root cause");
        LocationUpdateException ex = new LocationUpdateException("Location update failed", cause);

        assertEquals("Location update failed", ex.getMessage());
        assertEquals(cause, ex.getCause());
    }

    @Test
    void earningsUpdateException_withMessage() {
        EarningsUpdateException ex = new EarningsUpdateException("Earnings update failed");

        assertEquals("Earnings update failed", ex.getMessage());
    }

    @Test
    void earningsUpdateException_withCause() {
        Throwable cause = new RuntimeException("Root cause");
        EarningsUpdateException ex = new EarningsUpdateException("Earnings update failed", cause);

        assertEquals("Earnings update failed", ex.getMessage());
        assertEquals(cause, ex.getCause());
    }
}
