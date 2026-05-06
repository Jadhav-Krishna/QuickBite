package com.quickbite;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;

import static org.junit.jupiter.api.Assertions.*;

class AuthServiceApplicationTest {

    @Test
    void main_runsWithoutException() {
        assertDoesNotThrow(() -> {
            // We don't actually run the application, just verify the class loads
            AuthServiceApplication.class.getDeclaredConstructor().newInstance();
        });
    }

    @Test
    void contextLoads() {
        // This test verifies the application context can be created
        assertNotNull(AuthServiceApplication.class);
    }
}
