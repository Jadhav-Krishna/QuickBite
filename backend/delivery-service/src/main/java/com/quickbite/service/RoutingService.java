package com.quickbite.service;

import com.quickbite.client.OsrmClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class RoutingService {
    private static final String OSRM_URL = "http://router.project-osrm.org/route/v1/driving/";
    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired(required = false)
    private OsrmClient osrmClient;

    public Map<String, Object> getRoute(double startLon, double startLat, double endLon, double endLat) {
        try {
            String coordinates = String.format("%f,%f;%f,%f", startLon, startLat, endLon, endLat);
            if (osrmClient != null) {
                return osrmClient.getRoute(coordinates, "full", "geojson");
            }

            String url = String.format("%s%s?overview=full&geometries=geojson", OSRM_URL, coordinates);
            
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            log.error("Routing failed", e);
            return Map.of();
        }
    }
}
