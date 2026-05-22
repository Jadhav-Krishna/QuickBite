package com.quickbite;

import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.boot.SpringApplication;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mockStatic;

class ReviewServiceApplicationTest {

    @Test
    void canInstantiateApplicationClass() {
        assertNotNull(new ReviewServiceApplication());
    }

    @Test
    void mainStartsSpringApplication() {
        try (MockedStatic<SpringApplication> springApplication = mockStatic(SpringApplication.class)) {
            String[] args = {"--server.port=0"};

            ReviewServiceApplication.main(args);

            springApplication.verify(() -> SpringApplication.run(ReviewServiceApplication.class, args));
        }
    }
}
