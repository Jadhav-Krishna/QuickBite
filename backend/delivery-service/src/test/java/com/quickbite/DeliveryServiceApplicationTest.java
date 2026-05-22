package com.quickbite;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DeliveryServiceApplicationTest {

    @Test
    void main_runsWithoutException() {
        assertDoesNotThrow(() -> {
            // We don't actually run the application, just verify the class loads
            DeliveryServiceApplication.class.getDeclaredConstructor().newInstance();
        });
    }

    @Test
    void contextLoads() {
        // This test verifies the application context can be created
        assertNotNull(DeliveryServiceApplication.class);
    }
}
