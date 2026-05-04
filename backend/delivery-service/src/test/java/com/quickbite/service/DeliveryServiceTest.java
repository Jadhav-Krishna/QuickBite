package com.quickbite.service;

import com.quickbite.dto.DeliveryAgentDTO;
import com.quickbite.dto.LocationUpdateDTO;
import com.quickbite.entity.DeliveryAgent;
import com.quickbite.repository.DeliveryAgentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeliveryServiceTest {

    @Mock private DeliveryAgentRepository agentRepository;
    @Mock private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks private DeliveryService deliveryService;

    private DeliveryAgent agent;

    @BeforeEach
    void setup() {
        agent = new DeliveryAgent();
        agent.setId(1L);
        agent.setUserId(1L);
        agent.setFullName("Krishna");
        agent.setIsActive(true);
        agent.setIsVerified(true);
        agent.setIsOnline(true);
        agent.setTotalEarnings(0.0);
        agent.setTodayEarnings(0.0);
        agent.setTotalDeliveries(0L);
        agent.setTodayDeliveries(0);
    }

    // ================= REGISTER =================

    @Test
    void register_newAgent() {
        when(agentRepository.findByUserId(any())).thenReturn(Optional.empty());
        when(agentRepository.save(any())).thenReturn(agent);

        DeliveryAgentDTO dto = new DeliveryAgentDTO();
        dto.setUserId(1L);

        DeliveryAgentDTO result = deliveryService.registerDeliveryAgent(dto);

        assertNotNull(result);
        verify(agentRepository).save(any());
    }

    @Test
    void register_existingAgent() {
        when(agentRepository.findByUserId(any())).thenReturn(Optional.of(agent));

        DeliveryAgentDTO dto = new DeliveryAgentDTO();
        dto.setUserId(1L);

        DeliveryAgentDTO result = deliveryService.registerDeliveryAgent(dto);

        assertEquals(agent.getUserId(), result.getUserId());
        verify(agentRepository, never()).save(any());
    }

    // ================= GET =================

    @Test
    void getAgent_notFound() {
        when(agentRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> deliveryService.getDeliveryAgent(1L));
    }

    @Test
    void getAgentByUserId_success() {
        when(agentRepository.findByUserId(any()))
                .thenReturn(Optional.of(agent));

        Optional<DeliveryAgentDTO> result =
                deliveryService.getDeliveryAgentByUserId(1L);

        assertTrue(result.isPresent());
    }

    // ================= LOCATION =================

    @Test
    void updateLiveLocation_success() {
        when(agentRepository.findById(any())).thenReturn(Optional.of(agent));
        when(agentRepository.save(any())).thenReturn(agent);

        LocationUpdateDTO dto = new LocationUpdateDTO();
        dto.setLatitude(22.7);
        dto.setLongitude(75.8);
        dto.setOrderId(10L);

        deliveryService.updateLiveLocation(1L, dto);

        verify(agentRepository).save(any());
        verify(kafkaTemplate).send(anyString(), anyString(), any());
    }

    @Test
    void updateLiveLocation_agentNotFound() {
        when(agentRepository.findById(any())).thenReturn(Optional.empty());

        LocationUpdateDTO dto = new LocationUpdateDTO();

        assertThrows(RuntimeException.class,
                () -> deliveryService.updateLiveLocation(1L, dto));
    }

    // ================= AVAILABILITY =================

    @Test
    void toggleAvailability_success() {
        when(agentRepository.findById(any())).thenReturn(Optional.of(agent));

        deliveryService.toggleAgentAvailability(1L, false);

        verify(agentRepository).save(argThat(a -> !a.getIsOnline()));
    }

    // ================= EARNINGS =================

    @Test
    void updateEarnings_success() {
        when(agentRepository.findById(any())).thenReturn(Optional.of(agent));
        when(agentRepository.save(any())).thenReturn(agent);

        deliveryService.updateAgentEarnings(1L, 100.0);

        assertEquals(12.0, agent.getTotalEarnings());
    }

    @Test
    void updateEarnings_invalidAmount() {
        when(agentRepository.findById(any())).thenReturn(Optional.of(agent));

        deliveryService.updateAgentEarnings(1L, -10.0);

        verify(agentRepository, never()).save(any());
    }

    @Test
    void updateEarnings_agentNotFound() {
        when(agentRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> deliveryService.updateAgentEarnings(1L, 100.0));
    }

    // ================= DELIVERY =================

    @Test
    void markDelivered_success() {
        when(agentRepository.findById(any())).thenReturn(Optional.of(agent));
        when(agentRepository.save(any())).thenReturn(agent);

        deliveryService.markOrderDelivered(1L, 10L);

        assertEquals(1L, agent.getTotalDeliveries());
    }

    @Test
    void markDelivered_notFound() {
        when(agentRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> deliveryService.markOrderDelivered(1L, 10L));
    }

    // ================= PROFILE =================

    @Test
    void updateProfile_success() {
        when(agentRepository.findById(any())).thenReturn(Optional.of(agent));
        when(agentRepository.save(any())).thenReturn(agent);

        DeliveryAgentDTO dto = new DeliveryAgentDTO();
        dto.setFullName("Updated Name");

        DeliveryAgentDTO result =
                deliveryService.updateAgentProfile(1L, dto);

        assertEquals("Updated Name", result.getFullName());
    }

    // ================= FILTER =================

    @Test
    void getAvailableAgents_filtering() {
        DeliveryAgent inactive = new DeliveryAgent();
        inactive.setIsVerified(false);
        inactive.setIsOnline(true);

        when(agentRepository.findNearbyAgents(any(), any(), any()))
                .thenReturn(Arrays.asList(agent, inactive));

        List<DeliveryAgentDTO> result =
                deliveryService.getAvailableAgents(1.0, 1.0, 5.0);

        assertEquals(1, result.size());
    }
}