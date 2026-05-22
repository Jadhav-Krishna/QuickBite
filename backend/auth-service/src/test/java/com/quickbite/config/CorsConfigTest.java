package com.quickbite.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.junit.jupiter.api.Assertions.*;

class CorsConfigTest {

    @Test
    void corsConfigurationSource_created() {
        CorsConfig config = new CorsConfig();
        ReflectionTestUtils.setField(config, "allowedOrigins", "http://localhost:5173,http://localhost:3000");

        CorsConfigurationSource source = config.corsConfigurationSource();

        assertNotNull(source);
    }
}
