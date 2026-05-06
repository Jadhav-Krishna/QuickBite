package com.quickbite.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoutingServiceTest {

    private RoutingService routingService;
    private RestTemplate restTemplate;

    @BeforeEach
    void setup() {
        routingService = new RoutingService();
        restTemplate = mock(RestTemplate.class);
        ReflectionTestUtils.setField(routingService, "restTemplate", restTemplate);
    }

    @Test
    void getRoute_success() {
        Map<String, Object> mockResponse = new HashMap<>();
        mockResponse.put("code", "Ok");
        mockResponse.put("distance", 1500.0);

        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(mockResponse);

        Map<String, Object> result = routingService.getRoute(75.8, 22.7, 75.9, 22.8);

        assertNotNull(result);
        assertEquals("Ok", result.get("code"));
    }

    @Test
    void getRoute_failure() {
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenThrow(new RuntimeException("API error"));

        Map<String, Object> result = routingService.getRoute(75.8, 22.7, 75.9, 22.8);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getRoute_nullResponse() {
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(null);

        Map<String, Object> result = routingService.getRoute(75.8, 22.7, 75.9, 22.8);

        assertNull(result);
    }
}
