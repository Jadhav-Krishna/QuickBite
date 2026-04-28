package com.quickbite.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeocodingService {
    private static final String LOCATIONIQ_FORWARD_URL = "https://us1.locationiq.com/v1/search";
    private static final String LOCATIONIQ_REVERSE_URL = "https://us1.locationiq.com/v1/reverse";
    
    @Value("${locationiq.api.key:pk.624c039520a7274798e5f0e6445f04ec}")
    private String apiKey;
    
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Forward Geocoding: Convert address to coordinates
     */
    public Map<String, Double> geocodeAddress(String address) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(LOCATIONIQ_FORWARD_URL)
                    .queryParam("key", apiKey)
                    .queryParam("q", address)
                    .queryParam("format", "json")
                    .toUriString();

            List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);
            
            if (response != null && !response.isEmpty()) {
                Map<String, Object> result = response.get(0);
                double lat = Double.parseDouble(result.get("lat").toString());
                double lon = Double.parseDouble(result.get("lon").toString());
                
                log.info("Geocoded address '{}' to coordinates: {}, {}", address, lat, lon);
                return Map.of("latitude", lat, "longitude", lon);
            }
        } catch (Exception e) {
            log.error("Geocoding failed for address: {}", address, e);
        }
        return null;
    }
    
    /**
     * Reverse Geocoding: Convert coordinates to address
     */
    public Map<String, String> reverseGeocode(double latitude, double longitude) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(LOCATIONIQ_REVERSE_URL)
                    .queryParam("key", apiKey)
                    .queryParam("lat", latitude)
                    .queryParam("lon", longitude)
                    .queryParam("format", "json")
                    .toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("address")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> address = (Map<String, Object>) response.get("address");
                
                // Build address components
                String houseNumber = (String) address.get("house_number");
                String road = (String) address.get("road");
                String suburb = (String) address.get("suburb");
                String quarter = (String) address.get("quarter");
                String city = (String) address.get("city");
                String town = (String) address.get("town");
                String village = (String) address.get("village");
                String state = (String) address.get("state");
                String postcode = (String) address.get("postcode");
                String country = (String) address.get("country");
                
                // Build address line 1
                StringBuilder addressLine1 = new StringBuilder();
                if (houseNumber != null) addressLine1.append(houseNumber).append(", ");
                if (road != null) addressLine1.append(road);
                if (addressLine1.length() == 0 && suburb != null) addressLine1.append(suburb);
                if (addressLine1.length() == 0 && quarter != null) addressLine1.append(quarter);
                
                // Get city name
                String cityName = city != null ? city : (town != null ? town : village);
                
                log.info("Reverse geocoded coordinates ({}, {}) to address: {}", 
                        latitude, longitude, addressLine1.toString());
                
                return Map.of(
                    "addressLine1", addressLine1.toString(),
                    "city", cityName != null ? cityName : "",
                    "state", state != null ? state : "",
                    "pincode", postcode != null ? postcode : "",
                    "country", country != null ? country : "",
                    "displayName", (String) response.getOrDefault("display_name", "")
                );
            }
        } catch (Exception e) {
            log.error("Reverse geocoding failed for coordinates: {}, {}", latitude, longitude, e);
        }
        return null;
    }
}
