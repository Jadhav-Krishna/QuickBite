package com.quickbite.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class SecurityConfigTest {

    private final JwtAuthenticationFilter jwtAuthenticationFilter = mock(JwtAuthenticationFilter.class);
    private final SecurityConfig config = new SecurityConfig(jwtAuthenticationFilter);

    @Test
    void securityFilterChain_created() throws Exception {
        HttpSecurity http = mock(HttpSecurity.class, org.mockito.Answers.RETURNS_DEEP_STUBS);

        assertDoesNotThrow(() -> config.securityFilterChain(http));
    }
}
