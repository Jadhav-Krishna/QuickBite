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
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void geocodeAddress_nullResponse() {
        when(restTemplate.getForObject(anyString(), eq(List.class))).thenReturn(null);
        Map<String, Double> result = geocodingService.geocodeAddress("Nowhere");
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void geocodeAddress_exception() {
        when(restTemplate.getForObject(anyString(), eq(List.class)))
                .thenThrow(new RuntimeException("API error"));
        Map<String, Double> result = geocodingService.geocodeAddress("Error");
        assertNotNull(result);
        assertTrue(result.isEmpty());
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
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(response);
        Map<String, String> result = geocodingService.reverseGeocode(22.7, 75.8);
        assertEquals("Indore", result.get("city"));
        assertEquals("MP", result.get("state"));
        assertEquals("MG Road", result.get("addressLine1"));
    }

    @Test
    void reverseGeocode_withHouseNumber() {
        Map<String, Object> address = new HashMap<>();
        address.put("house_number", "42");
        address.put("road", "Main Street");
        address.put("city", "Mumbai");
        address.put("state", "MH");
        address.put("postcode", "400001");
        address.put("country", "India");
        Map<String, Object> response = new HashMap<>();
        response.put("address", address);
        response.put("display_name", "42, Main Street, Mumbai");
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(response);
        Map<String, String> result = geocodingService.reverseGeocode(19.0, 72.8);
        assertEquals("42, Main Street", result.get("addressLine1"));
    }

    @Test
    void reverseGeocode_fallbackToTown() {
        Map<String, Object> address = new HashMap<>();
        address.put("road", "NH44");
        address.put("town", "SmallTown");
        address.put("state", "KA");
        address.put("postcode", "560001");
        address.put("country", "India");
        Map<String, Object> response = new HashMap<>();
        response.put("address", address);
        response.put("display_name", "SmallTown");
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(response);
        Map<String, String> result = geocodingService.reverseGeocode(12.0, 77.0);
        assertEquals("SmallTown", result.get("city"));
    }

    @Test
    void reverseGeocode_fallbackToVillage() {
        Map<String, Object> address = new HashMap<>();
        address.put("road", "Village Road");
        address.put("village", "MyVillage");
        address.put("state", "RJ");
        address.put("country", "India");
        Map<String, Object> response = new HashMap<>();
        response.put("address", address);
        response.put("display_name", "MyVillage");
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(response);
        Map<String, String> result = geocodingService.reverseGeocode(26.0, 73.0);
        assertEquals("MyVillage", result.get("city"));
        assertEquals("", result.get("pincode"));
    }

    @Test
    void reverseGeocode_fallbackToSuburb() {
        Map<String, Object> address = new HashMap<>();
        address.put("suburb", "Downtown");
        address.put("city", "CityX");
        address.put("state", "ST");
        address.put("country", "Country");
        Map<String, Object> response = new HashMap<>();
        response.put("address", address);
        response.put("display_name", "Downtown");
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(response);
        Map<String, String> result = geocodingService.reverseGeocode(10.0, 20.0);
        assertEquals("Downtown", result.get("addressLine1"));
    }

    @Test
    void reverseGeocode_fallbackToQuarter() {
        Map<String, Object> address = new HashMap<>();
        address.put("quarter", "Old Quarter");
        address.put("city", "CityY");
        address.put("state", "ST");
        address.put("country", "Country");
        Map<String, Object> response = new HashMap<>();
        response.put("address", address);
        response.put("display_name", "Old Quarter");
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(response);
        Map<String, String> result = geocodingService.reverseGeocode(10.0, 20.0);
        assertEquals("Old Quarter", result.get("addressLine1"));
    }

    @Test
    void reverseGeocode_nullResponse() {
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(null);
        Map<String, String> result = geocodingService.reverseGeocode(0, 0);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void reverseGeocode_noAddressKey() {
        Map<String, Object> response = new HashMap<>();
        response.put("display_name", "Unknown");
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(response);
        Map<String, String> result = geocodingService.reverseGeocode(0, 0);
        assertTrue(result.isEmpty());
    }

    @Test
    void reverseGeocode_exception() {
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenThrow(new RuntimeException("API error"));
        Map<String, String> result = geocodingService.reverseGeocode(0, 0);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void reverseGeocode_noCityTownVillage() {
        Map<String, Object> address = new HashMap<>();
        address.put("road", "Lonely Road");
        address.put("state", "XX");
        address.put("country", "Country");
        Map<String, Object> response = new HashMap<>();
        response.put("address", address);
        response.put("display_name", "Lonely Road");
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(response);
        Map<String, String> result = geocodingService.reverseGeocode(0, 0);
        assertEquals("", result.get("city"));
    }
}