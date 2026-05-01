package com.quickbite.service;

import com.quickbite.dto.DeliveryAgentDTO;
import com.quickbite.entity.DeliveryAgent;
import com.quickbite.repository.DeliveryAgentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeliveryServiceTest {

    @Mock
    private DeliveryAgentRepository agentRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private DeliveryService deliveryService;

    private DeliveryAgent testAgent;

    @BeforeEach
    void setUp() {
        testAgent = new DeliveryAgent();
        testAgent.setId(1L);
        testAgent.setUserId(1L);
        testAgent.setIsOnline(true);
        testAgent.setIsActive(true);
        testAgent.setIsVerified(true);
        testAgent.setCurrentLatitude(12.9716);
        testAgent.setCurrentLongitude(77.5946);
    }

    @Test
    void getAgentById_Success() {
        when(agentRepository.findById(anyLong())).thenReturn(Optional.of(testAgent));

        DeliveryAgentDTO result = deliveryService.getDeliveryAgent(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(agentRepository).findById(1L);
    }

    @Test
    void getAvailableAgents_Success() {
        when(agentRepository.findNearbyAgents(anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(Arrays.asList(testAgent));

        List<DeliveryAgentDTO> results = deliveryService.getAvailableAgents(12.9716, 77.5946, 5.0);

        assertNotNull(results);
        assertEquals(1, results.size());
    }

    @Test
    void updateAgentAvailability_Success() {
        when(agentRepository.findById(anyLong())).thenReturn(Optional.of(testAgent));
        when(agentRepository.save(any(DeliveryAgent.class))).thenReturn(testAgent);

        deliveryService.toggleAgentAvailability(1L, false);

        verify(agentRepository).save(argThat(agent -> !agent.getIsOnline()));
    }

    @Test
    void getAllAgents_Success() {
        when(agentRepository.findAll()).thenReturn(Arrays.asList(testAgent));

        List<DeliveryAgentDTO> results = deliveryService.getAllAgents();

        assertNotNull(results);
        assertEquals(1, results.size());
    }
}
