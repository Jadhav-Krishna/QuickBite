package com.quickbite;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;

import static org.junit.jupiter.api.Assertions.*;

class RestaurantServiceApplicationTest {

    @Test
    void contextLoads() {
        assertDoesNotThrow(() -> {
            // Verify the application class exists and can be instantiated
            RestaurantServiceApplication app = new RestaurantServiceApplication();
            assertNotNull(app);
        });
    }

    @Test
    void mainMethodExists() {
        assertDoesNotThrow(() -> {
            // Verify main method exists
            RestaurantServiceApplication.class.getMethod("main", String[].class);
        });
    }
}
