package com.quickbite.util;

import com.quickbite.entity.User;
import com.quickbite.entity.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private User user;

    @BeforeEach
    void setup() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "mySecretKeyForJWTTokenGenerationAndValidationPurposeOnlyForDevelopment");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", 3600000);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtRefreshExpirationMs", 86400000);

        user = User.builder()
                .id(1L)
                .email("test@mail.com")
                .fullName("Test User")
                .role(UserRole.CUSTOMER)
                .build();
    }

    @Test
    void generateAccessToken_withAuthentication() {
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("test@mail.com");

        String token = jwtTokenProvider.generateAccessToken(auth);

        assertNotNull(token);
        assertTrue(token.length() > 0);
    }

    @Test
    void generateAccessToken_withEmail() {
        String token = jwtTokenProvider.generateAccessToken("test@mail.com");

        assertNotNull(token);
        assertTrue(token.length() > 0);
    }

    @Test
    void generateAccessToken_withUser() {
        String token = jwtTokenProvider.generateAccessToken(user);

        assertNotNull(token);
        assertTrue(token.length() > 0);
    }

    @Test
    void generateRefreshToken_success() {
        String token = jwtTokenProvider.generateRefreshToken("test@mail.com");

        assertNotNull(token);
        assertTrue(token.length() > 0);
    }

    @Test
    void getEmailFromToken_success() {
        String token = jwtTokenProvider.generateAccessToken("test@mail.com");

        String email = jwtTokenProvider.getEmailFromToken(token);

        assertEquals("test@mail.com", email);
    }

    @Test
    void getEmailFromToken_invalid() {
        String email = jwtTokenProvider.getEmailFromToken("invalid.token.here");

        assertNull(email);
    }

    @Test
    void validateToken_success() {
        String token = jwtTokenProvider.generateAccessToken("test@mail.com");

        boolean valid = jwtTokenProvider.validateToken(token);

        assertTrue(valid);
    }

    @Test
    void validateToken_invalid() {
        boolean valid = jwtTokenProvider.validateToken("invalid.token.here");

        assertFalse(valid);
    }

    @Test
    void validateToken_malformed() {
        boolean valid = jwtTokenProvider.validateToken("malformed");

        assertFalse(valid);
    }

    @Test
    void validateToken_expired() {
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", -1000);
        String token = jwtTokenProvider.generateAccessToken("test@mail.com");

        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        boolean valid = jwtTokenProvider.validateToken(token);

        assertFalse(valid);
    }

    @Test
    void validateToken_empty() {
        boolean valid = jwtTokenProvider.validateToken("");

        assertFalse(valid);
    }

    @Test
    void getTokenExpirationTime_success() {
        long expiration = jwtTokenProvider.getTokenExpirationTime();

        assertEquals(3600000L, expiration);
    }

    @Test
    void getUserRole_success() {
        String token = jwtTokenProvider.generateAccessToken(user);

        String role = jwtTokenProvider.getUserRole(token);

        assertEquals("CUSTOMER", role);
    }

    @Test
    void getUserRole_invalid() {
        String role = jwtTokenProvider.getUserRole("invalid.token");

        assertNull(role);
    }

    @Test
    void getUserIdFromToken_success() {
        String token = jwtTokenProvider.generateAccessToken(user);

        Long userId = jwtTokenProvider.getUserIdFromToken(token);

        assertEquals(1L, userId);
    }

    @Test
    void getUserIdFromToken_invalid() {
        Long userId = jwtTokenProvider.getUserIdFromToken("invalid.token");

        assertNull(userId);
    }

    @Test
    void getUserIdFromToken_integerValue() {
        String token = jwtTokenProvider.generateAccessToken(user);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);

        assertNotNull(userId);
    }

    @Test
    void getUserIdFromToken_nullValue() {
        String token = jwtTokenProvider.generateAccessToken("test@mail.com");
        Long userId = jwtTokenProvider.getUserIdFromToken(token);

        assertNull(userId);
    }
}
