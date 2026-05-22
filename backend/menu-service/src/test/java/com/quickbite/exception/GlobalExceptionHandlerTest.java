package com.quickbite.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler exceptionHandler;

    @Test
    void handleResourceNotFound() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Resource not found");

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleResourceNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Resource not found", response.getBody().get("message"));
        assertEquals(404, response.getBody().get("status"));
    }

    @Test
    void handleInvalidRequest() {
        InvalidRequestException ex = new InvalidRequestException("Invalid request");

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleInvalidRequest(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid request", response.getBody().get("message"));
        assertEquals(400, response.getBody().get("status"));
    }

    @Test
    void handleImageUpload() {
        ImageUploadException ex = new ImageUploadException("Upload failed");

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleImageUpload(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Upload failed", response.getBody().get("message"));
        assertEquals(500, response.getBody().get("status"));
    }

    @Test
    void handleGenericException() {
        Exception ex = new Exception("Unexpected error");

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleGenericException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("An unexpected error occurred", response.getBody().get("message"));
        assertEquals(500, response.getBody().get("status"));
    }

    @Test
    void handleImageUploadWithCause() {
        ImageUploadException ex = new ImageUploadException("Upload failed", new RuntimeException("Root cause"));

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleImageUpload(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody().get("timestamp"));
    }
}
