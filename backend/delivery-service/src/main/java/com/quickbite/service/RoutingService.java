package com.quickbite.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class RoutingService {
    private static final String OSRM_URL = "http://router.project-osrm.org/route/v1/driving/";
    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> getRoute(double startLon, double startLat, double endLon, double endLat) {
        try {
            String url = String.format("%s%f,%f;%f,%f?overview=full&geometries=geojson", 
                OSRM_URL, startLon, startLat, endLon, endLat);
            
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return response;
        } catch (Exception e) {
            log.error("Routing failed", e);
            return null;
        }
    }
}
