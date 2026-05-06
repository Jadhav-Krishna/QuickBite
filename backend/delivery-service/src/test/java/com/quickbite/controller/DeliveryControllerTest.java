package com.quickbite.controller;

import com.quickbite.dto.DeliveryAgentDTO;
import com.quickbite.dto.LocationUpdateDTO;
import com.quickbite.service.DeliveryService;
import com.quickbite.service.RoutingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeliveryControllerTest {

    @Mock
    private DeliveryService deliveryService;

    @Mock
    private RoutingService routingService;

    @InjectMocks
    private DeliveryController controller;

    private DeliveryAgentDTO agentDTO;

    @BeforeEach
    void setup() {
        agentDTO = new DeliveryAgentDTO();
        agentDTO.setId(1L);
        agentDTO.setUserId(100L);
        agentDTO.setFullName("Test Agent");
    }

    @Test
    void registerAgent_success() {
        when(deliveryService.registerDeliveryAgent(any())).thenReturn(agentDTO);

        ResponseEntity<DeliveryAgentDTO> response = controller.registerAgent(agentDTO);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void getAgent_success() {
        when(deliveryService.getDeliveryAgent(any())).thenReturn(agentDTO);

        ResponseEntity<DeliveryAgentDTO> response = controller.getAgent(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void getAgentByUserId_found() {
        when(deliveryService.getDeliveryAgentByUserId(any())).thenReturn(Optional.of(agentDTO));

        ResponseEntity<DeliveryAgentDTO> response = controller.getAgentByUserId(100L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getAgentByUserId_notFound() {
        when(deliveryService.getDeliveryAgentByUserId(any())).thenReturn(Optional.empty());

        ResponseEntity<DeliveryAgentDTO> response = controller.getAgentByUserId(100L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void updateLocation_success() {
        LocationUpdateDTO dto = new LocationUpdateDTO();
        doNothing().when(deliveryService).updateLiveLocation(any(), any());

        ResponseEntity<Void> response = controller.updateLocation(1L, dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void toggleAvailability_success() {
        doNothing().when(deliveryService).toggleAgentAvailability(any(), any());

        ResponseEntity<Void> response = controller.toggleAvailability(1L, true);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void markPickedUp_success() {
        doNothing().when(deliveryService).markOrderPickedUp(any(), any());

        ResponseEntity<Void> response = controller.markPickedUp(1L, 10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void markDelivered_success() {
        doNothing().when(deliveryService).markOrderDelivered(any(), any());
        doNothing().when(deliveryService).updateAgentEarnings(any(), any());

        ResponseEntity<Void> response = controller.markDelivered(1L, 10L, 100.0);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(deliveryService).markOrderDelivered(1L, 10L);
        verify(deliveryService).updateAgentEarnings(1L, 100.0);
    }

    @Test
    void getAgentEarnings_success() {
        when(deliveryService.getAgentEarnings(any())).thenReturn(agentDTO);

        ResponseEntity<DeliveryAgentDTO> response = controller.getAgentEarnings(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getAvailableAgents_success() {
        when(deliveryService.getAvailableAgents(anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(Arrays.asList(agentDTO));

        ResponseEntity<List<DeliveryAgentDTO>> response = 
                controller.getAvailableAgents(22.7, 75.8, 5.0);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getAllAgents_success() {
        when(deliveryService.getAllAgents()).thenReturn(Arrays.asList(agentDTO));

        ResponseEntity<List<DeliveryAgentDTO>> response = controller.getAllAgents();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void updateProfile_success() {
        when(deliveryService.updateAgentProfile(any(), any())).thenReturn(agentDTO);

        ResponseEntity<DeliveryAgentDTO> response = controller.updateProfile(1L, agentDTO);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getRoute_success() {
        Map<String, Object> route = new HashMap<>();
        route.put("distance", 1500.0);
        when(routingService.getRoute(anyDouble(), anyDouble(), anyDouble(), anyDouble())).thenReturn(route);

        ResponseEntity<Map<String, Object>> response = 
                controller.getRoute(75.8, 22.7, 75.9, 22.8);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }
}
