package com.quickbite.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler handler;

    @Test
    void handleAuthenticationException() {
        AuthenticationException ex = new AuthenticationException("Auth failed");

        ResponseEntity<Map<String, Object>> response = handler.handleAuthenticationException(ex);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Auth failed", response.getBody().get("message"));
    }

    @Test
    void handleInvalidCredentialsException() {
        InvalidCredentialsException ex = new InvalidCredentialsException("Invalid creds");

        ResponseEntity<Map<String, Object>> response = handler.handleInvalidCredentialsException(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid creds", response.getBody().get("message"));
    }

    @Test
    void handleUserAlreadyExistsException() {
        UserAlreadyExistsException ex = new UserAlreadyExistsException("User exists");

        ResponseEntity<Map<String, Object>> response = handler.handleUserAlreadyExistsException(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("User exists", response.getBody().get("message"));
    }

    @Test
    void handleAddressNotFoundException() {
        AddressNotFoundException ex = new AddressNotFoundException("Address not found");

        ResponseEntity<Map<String, Object>> response = handler.handleAddressNotFoundException(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Address not found", response.getBody().get("message"));
    }

    @Test
    void handleInvalidTokenException() {
        InvalidTokenException ex = new InvalidTokenException("Invalid token");

        ResponseEntity<Map<String, Object>> response = handler.handleInvalidTokenException(ex);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid token", response.getBody().get("message"));
    }

    @Test
    void handleValidationException() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("object", "field", "error message");

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

        ResponseEntity<Map<String, Object>> response = handler.handleValidationException(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Validation Failed", response.getBody().get("error"));
        assertNotNull(response.getBody().get("fieldErrors"));
    }

    @Test
    void handleRuntimeException() {
        RuntimeException ex = new RuntimeException("Runtime error");

        ResponseEntity<Map<String, Object>> response = handler.handleRuntimeException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Runtime error", response.getBody().get("message"));
    }
}
