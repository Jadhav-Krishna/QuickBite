package com.quickbite.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ExceptionTest {

    @Test
    void authenticationException_withMessage() {
        AuthenticationException ex = new AuthenticationException("Auth failed");

        assertEquals("Auth failed", ex.getMessage());
    }

    @Test
    void authenticationException_withCause() {
        Throwable cause = new RuntimeException("Root cause");
        AuthenticationException ex = new AuthenticationException("Auth failed", cause);

        assertEquals("Auth failed", ex.getMessage());
        assertEquals(cause, ex.getCause());
    }

    @Test
    void invalidCredentialsException_withMessage() {
        InvalidCredentialsException ex = new InvalidCredentialsException("Invalid creds");

        assertEquals("Invalid creds", ex.getMessage());
    }

    @Test
    void invalidCredentialsException_withCause() {
        Throwable cause = new RuntimeException("Root cause");
        InvalidCredentialsException ex = new InvalidCredentialsException("Invalid creds", cause);

        assertEquals("Invalid creds", ex.getMessage());
        assertEquals(cause, ex.getCause());
    }

    @Test
    void userAlreadyExistsException_withMessage() {
        UserAlreadyExistsException ex = new UserAlreadyExistsException("User exists");

        assertEquals("User exists", ex.getMessage());
    }

    @Test
    void userAlreadyExistsException_withCause() {
        Throwable cause = new RuntimeException("Root cause");
        UserAlreadyExistsException ex = new UserAlreadyExistsException("User exists", cause);

        assertEquals("User exists", ex.getMessage());
        assertEquals(cause, ex.getCause());
    }

    @Test
    void addressNotFoundException_withMessage() {
        AddressNotFoundException ex = new AddressNotFoundException("Address not found");

        assertEquals("Address not found", ex.getMessage());
    }

    @Test
    void invalidTokenException_withMessage() {
        InvalidTokenException ex = new InvalidTokenException("Invalid token");

        assertEquals("Invalid token", ex.getMessage());
    }
}
