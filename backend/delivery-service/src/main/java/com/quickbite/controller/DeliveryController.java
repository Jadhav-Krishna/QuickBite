package com.quickbite.controller;

import com.quickbite.dto.DeliveryAgentDTO;
import com.quickbite.dto.LocationUpdateDTO;
import com.quickbite.service.DeliveryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/delivery")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    @PostMapping("/agents/register")
    public ResponseEntity<DeliveryAgentDTO> registerAgent(@RequestBody DeliveryAgentDTO request) {
        DeliveryAgentDTO registered = deliveryService.registerDeliveryAgent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(registered);
    }

    @GetMapping("/agents/{agentId}")
    public ResponseEntity<DeliveryAgentDTO> getAgent(@PathVariable Long agentId) {
        return ResponseEntity.ok(deliveryService.getDeliveryAgent(agentId));
    }

    @PutMapping("/agents/{agentId}/location")
    public ResponseEntity<Void> updateLocation(
            @PathVariable Long agentId,
            @RequestBody LocationUpdateDTO locationUpdate) {
        deliveryService.updateLiveLocation(agentId, locationUpdate);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/agents/{agentId}/availability")
    public ResponseEntity<Void> toggleAvailability(
            @PathVariable Long agentId,
            @RequestParam Boolean isOnline) {
        deliveryService.toggleAgentAvailability(agentId, isOnline);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/agents/{agentId}/orders/{orderId}/pickup")
    public ResponseEntity<Void> markPickedUp(
            @PathVariable Long agentId,
            @PathVariable Long orderId) {
        deliveryService.markOrderPickedUp(agentId, orderId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/agents/{agentId}/orders/{orderId}/deliver")
    public ResponseEntity<Void> markDelivered(
            @PathVariable Long agentId,
            @PathVariable Long orderId) {
        deliveryService.markOrderDelivered(agentId, orderId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/agents/{agentId}/earnings")
    public ResponseEntity<DeliveryAgentDTO> getAgentEarnings(@PathVariable Long agentId) {
        return ResponseEntity.ok(deliveryService.getAgentEarnings(agentId));
    }

    @GetMapping("/agents/nearby")
    public ResponseEntity<List<DeliveryAgentDTO>> getAvailableAgents(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5.0") Double radiusKm) {
        return ResponseEntity.ok(deliveryService.getAvailableAgents(latitude, longitude, radiusKm));
    }
}
