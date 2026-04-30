package com.quickbite.service;

import com.quickbite.dto.DeliveryAgentDTO;
import com.quickbite.entity.DeliveryAgent;
import com.quickbite.entity.DeliveryStatus;
import com.quickbite.repository.DeliveryAgentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeliveryServiceTest {

    @Mock
    private DeliveryAgentRepository deliveryAgentRepository;

    @InjectMocks
    private DeliveryService deliveryService;

    private DeliveryAgent testAgent;

    @BeforeEach
    void setUp() {
        testAgent = new DeliveryAgent();
        testAgent.setId(1L);
        testAgent.setUserId(1L);
        testAgent.setIsAvailable(true);
        testAgent.setIsActive(true);
    }

    @Test
    void getAgentById_Success() {
        when(deliveryAgentRepository.findById(anyLong())).thenReturn(Optional.of(testAgent));

        DeliveryAgentDTO result = deliveryService.getAgentById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(deliveryAgentRepository).findById(1L);
    }

    @Test
    void getAvailableAgents_Success() {
        when(deliveryAgentRepository.findByIsAvailableAndIsActive(anyBoolean(), anyBoolean()))
                .thenReturn(Arrays.asList(testAgent));

        List<DeliveryAgentDTO> results = deliveryService.getAvailableAgents();

        assertNotNull(results);
        assertEquals(1, results.size());
    }

    @Test
    void updateAgentAvailability_Success() {
        when(deliveryAgentRepository.findById(anyLong())).thenReturn(Optional.of(testAgent));
        when(deliveryAgentRepository.save(any(DeliveryAgent.class))).thenReturn(testAgent);

        deliveryService.updateAgentAvailability(1L, false);

        verify(deliveryAgentRepository).save(argThat(agent -> !agent.getIsAvailable()));
    }

    @Test
    void assignOrderToAgent_Success() {
        when(deliveryAgentRepository.findById(anyLong())).thenReturn(Optional.of(testAgent));
        when(deliveryAgentRepository.save(any(DeliveryAgent.class))).thenReturn(testAgent);

        deliveryService.assignOrderToAgent(1L, 100L);

        verify(deliveryAgentRepository).save(any(DeliveryAgent.class));
    }
}
