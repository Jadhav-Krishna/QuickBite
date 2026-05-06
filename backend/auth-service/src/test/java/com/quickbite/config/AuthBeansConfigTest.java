package com.quickbite.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;

class AuthBeansConfigTest {

    private final AuthBeansConfig config = new AuthBeansConfig();

    @Test
    void passwordEncoder_created() {
        PasswordEncoder encoder = config.passwordEncoder();

        assertNotNull(encoder);
        String encoded = encoder.encode("password");
        assertTrue(encoder.matches("password", encoded));
    }

    @Test
    void restTemplate_created() {
        RestTemplate template = config.restTemplate();

        assertNotNull(template);
    }
}
