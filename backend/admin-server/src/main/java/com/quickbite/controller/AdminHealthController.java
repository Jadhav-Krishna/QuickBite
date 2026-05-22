package com.quickbite.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@Slf4j
@CrossOrigin(origins = "*")
public class AdminHealthController {

    @Autowired(required = false)
    private HealthEndpoint healthEndpoint;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Map<String, Object> response = new HashMap<>();
        
        if (healthEndpoint != null) {
            HealthComponent healthComponent = healthEndpoint.health();
            response.put("status", healthComponent.getStatus().getCode());
            response.put("components", new HashMap<>());
        } else {
            response.put("status", "UP");
            response.put("message", "Health endpoint not configured");
        }
        
        response.put("timestamp", new Date());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfiguration() {
        Map<String, Object> config = new HashMap<>();
        config.put("services", Arrays.asList(
            createService("auth-service", 8001),
            createService("restaurant-service", 8002),
            createService("menu-service", 8003),
            createService("cart-service", 8004),
            createService("order-service", 8005),
            createService("payment-service", 8006),
            createService("delivery-service", 8007),
            createService("review-service", 8008),
            createService("notification-service", 8009)
        ));
        config.put("timestamp", new Date());
        return ResponseEntity.ok(config);
    }

    private Map<String, Object> createService(String name, int port) {
        Map<String, Object> service = new HashMap<>();
        service.put("name", name);
        service.put("port", port);
        service.put("status", "RUNNING");
        return service;
    }
}
