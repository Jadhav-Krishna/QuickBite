package com.quickbite;

import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.boot.SpringApplication;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mockStatic;

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
    void mainStartsSpringApplication() {
        try (MockedStatic<SpringApplication> springApplication = mockStatic(SpringApplication.class)) {
            String[] args = {"--server.port=0"};

            RestaurantServiceApplication.main(args);

            springApplication.verify(() -> SpringApplication.run(RestaurantServiceApplication.class, args));
        }
    }
}
