package com.quickbite.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GeocodingServiceTest {

    private GeocodingService geocodingService;

    @Mock
    private RestTemplate restTemplate;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        geocodingService = new GeocodingService();

        // Inject mock RestTemplate
        ReflectionTestUtils.setField(geocodingService, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(geocodingService, "apiKey", "test-key");
    }

    // ================= FORWARD =================

    @Test
    void geocodeAddress_success() {
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("lat", "22.7196");
        responseMap.put("lon", "75.8577");

        when(restTemplate.getForObject(anyString(), eq(List.class)))
                .thenReturn(List.of(responseMap));

        Map<String, Double> result = geocodingService.geocodeAddress("Indore");

        assertEquals(22.7196, result.get("latitude"));
        assertEquals(75.8577, result.get("longitude"));
    }

    @Test
    void geocodeAddress_emptyResponse() {
        when(restTemplate.getForObject(anyString(), eq(List.class)))
                .thenReturn(Collections.emptyList());

        Map<String, Double> result = geocodingService.geocodeAddress("Unknown");

        assertNull(result);
    }

    // ================= REVERSE =================

    @Test
    void reverseGeocode_success() {
        Map<String, Object> address = new HashMap<>();
        address.put("road", "MG Road");
        address.put("city", "Indore");
        address.put("state", "MP");
        address.put("postcode", "452001");
        address.put("country", "India");

        Map<String, Object> response = new HashMap<>();
        response.put("address", address);
        response.put("display_name", "Indore, MP, India");

        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenReturn(response);

        Map<String, String> result = geocodingService.reverseGeocode(22.7, 75.8);

        assertEquals("Indore", result.get("city"));
        assertEquals("MP", result.get("state"));
    }

    @Test
    void reverseGeocode_failure() {
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenReturn(null);

        Map<String, String> result = geocodingService.reverseGeocode(0, 0);

        assertNull(result);
    }
}