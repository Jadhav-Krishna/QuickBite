package com.quickbite.service;

import com.quickbite.dto.DeliveryAgentDTO;
import com.quickbite.dto.LocationUpdateDTO;
import com.quickbite.entity.DeliveryAgent;
import com.quickbite.event.LocationUpdateEvent;
import com.quickbite.repository.DeliveryAgentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.quickbite.config.KafkaConfig.LOCATION_UPDATE_TOPIC;

@Service
@Transactional
@Slf4j
public class DeliveryService {

    @Autowired
    private DeliveryAgentRepository agentRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public DeliveryAgentDTO registerDeliveryAgent(DeliveryAgentDTO request) {
        log.info("Registering delivery agent: {}", request.getPhone());

        // Check if agent already exists by userId
        Optional<DeliveryAgent> existingAgent = agentRepository.findByUserId(request.getUserId());
        if (existingAgent.isPresent()) {
            log.info("Agent already exists for userId: {}", request.getUserId());
            return mapToDTO(existingAgent.get());
        }

        DeliveryAgent agent = DeliveryAgent.builder()
                .userId(request.getUserId())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .vehicleType(request.getVehicleType())
                .vehicleNumber(request.getVehicleNumber())
                .licenseNumber(request.getLicenseNumber())
                .aadharNumber(request.getAadharNumber())
                .isVerified(false)
                .isActive(false)
                .currentLatitude(0.0)
                .currentLongitude(0.0)
                .totalDeliveries(0L)
                .averageRating(0.0)
                .createdAt(LocalDateTime.now())
                .build();

        DeliveryAgent savedAgent = agentRepository.save(agent);
        log.info("Delivery agent registered with ID: {}", savedAgent.getId());

        return mapToDTO(savedAgent);
    }

    public DeliveryAgentDTO getDeliveryAgent(Long agentId) {
        DeliveryAgent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Delivery agent not found"));
        return mapToDTO(agent);
    }

    public Optional<DeliveryAgentDTO> getDeliveryAgentByUserId(Long userId) {
        return agentRepository.findByUserId(userId).map(this::mapToDTO);
    }

    public void updateLiveLocation(Long agentId, LocationUpdateDTO locationUpdate) {
        try {
            log.info("Updating live location for agent: {} at lat: {}, lng: {}", 
                    agentId, locationUpdate.getLatitude(), locationUpdate.getLongitude());

            DeliveryAgent agent = agentRepository.findById(agentId)
                    .orElseThrow(() -> new RuntimeException("Delivery agent not found"));

            // Update agent location
            agent.setCurrentLatitude(locationUpdate.getLatitude());
            agent.setCurrentLongitude(locationUpdate.getLongitude());
            agent.setLastLocationUpdateTime(LocalDateTime.now());
            agent.setLastKnownAddress(locationUpdate.getAddress());

            agentRepository.save(agent);

            // Publish location update event to Kafka for real-time tracking
            LocationUpdateEvent event = LocationUpdateEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .deliveryAgentId(agentId)
                    .orderId(locationUpdate.getOrderId())
                    .latitude(locationUpdate.getLatitude())
                    .longitude(locationUpdate.getLongitude())
                    .accuracy(locationUpdate.getAccuracy())
                    .timestamp(LocalDateTime.now())
                    .address(locationUpdate.getAddress())
                    .status(locationUpdate.getStatus())
                    .build();

            kafkaTemplate.send(LOCATION_UPDATE_TOPIC, agentId.toString(), event);
            log.info("Location update event published for agent: {}", agentId);

        } catch (Exception e) {
            log.error("Error updating location for agent: {}", agentId, e);
            throw new RuntimeException("Failed to update location: " + e.getMessage());
        }
    }

    public void toggleAgentAvailability(Long agentId, Boolean isOnline) {
        log.info("Toggling agent availability - Agent: {}, Online: {}", agentId, isOnline);

        DeliveryAgent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Delivery agent not found"));

        agent.setIsOnline(isOnline);
        agent.setLastStatusUpdateTime(LocalDateTime.now());

        agentRepository.save(agent);
        log.info("Agent availability updated: {}", agentId);
    }

    public void markOrderPickedUp(Long agentId, Long orderId) {
        log.info("Marking order picked up - Order: {}, Agent: {}", orderId, agentId);
        // Implementation to update order status
    }

    public void updateAgentEarnings(Long agentId, Double orderAmount) {
        log.info("Updating agent earnings - Agent: {}, Amount: {}", agentId, orderAmount);
        
        try {
            DeliveryAgent agent = agentRepository.findById(agentId)
                    .orElseThrow(() -> new RuntimeException("Delivery agent not found with ID: " + agentId));
            
            if (orderAmount == null || orderAmount <= 0) {
                log.warn("Invalid order amount for agent earnings update: {}", orderAmount);
                return;
            }
            
            // Calculate agent commission (12% of order amount)
            Double commission = orderAmount * 0.12;
            
            // Update earnings with null safety
            Double currentTotalEarnings = agent.getTotalEarnings() != null ? agent.getTotalEarnings() : 0.0;
            Double currentTodayEarnings = agent.getTodayEarnings() != null ? agent.getTodayEarnings() : 0.0;
            
            agent.setTotalEarnings(currentTotalEarnings + commission);
            agent.setTodayEarnings(currentTodayEarnings + commission);
            
            agentRepository.save(agent);
            log.info("Agent earnings updated successfully - Agent: {}, Commission: {}, Total: {}, Today: {}", 
                    agentId, commission, agent.getTotalEarnings(), agent.getTodayEarnings());
        } catch (Exception e) {
            log.error("Failed to update agent earnings - Agent: {}, Amount: {}", agentId, orderAmount, e);
            throw new RuntimeException("Failed to update agent earnings: " + e.getMessage());
        }
    }

    public void markOrderDelivered(Long agentId, Long orderId) {
        log.info("Marking order delivered - Order: {}, Agent: {}", orderId, agentId);
        
        try {
            DeliveryAgent agent = agentRepository.findById(agentId)
                    .orElseThrow(() -> new RuntimeException("Delivery agent not found with ID: " + agentId));
            
            // Update delivery count with null safety
            Long currentTotalDeliveries = agent.getTotalDeliveries() != null ? agent.getTotalDeliveries() : 0L;
            Integer currentTodayDeliveries = agent.getTodayDeliveries() != null ? agent.getTodayDeliveries() : 0;
            
            agent.setTotalDeliveries(currentTotalDeliveries + 1);
            agent.setTodayDeliveries(currentTodayDeliveries + 1);
            
            agentRepository.save(agent);
            log.info("Agent delivery count updated successfully - Agent: {}, Total: {}, Today: {}", 
                    agentId, agent.getTotalDeliveries(), agent.getTodayDeliveries());
        } catch (Exception e) {
            log.error("Failed to mark order delivered - Order: {}, Agent: {}", orderId, agentId, e);
            throw new RuntimeException("Failed to mark order delivered: " + e.getMessage());
        }
    }

    public DeliveryAgentDTO getAgentEarnings(Long agentId) {
        DeliveryAgent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Delivery agent not found"));
        return mapToDTO(agent);
    }

    public List<DeliveryAgentDTO> getAllAgents() {
        return agentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<DeliveryAgentDTO> getAvailableAgents(Double latitude, Double longitude, Double radiusKm) {
        log.info("Fetching available agents near lat: {}, lng: {}", latitude, longitude);
        
        // Query agents within radius using spatial queries
        List<DeliveryAgent> agents = agentRepository.findNearbyAgents(latitude, longitude, radiusKm);

        return agents.stream()
                .filter(a -> a.getIsVerified() && a.getIsOnline())
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public DeliveryAgentDTO updateAgentProfile(Long agentId, DeliveryAgentDTO request) {
        log.info("Updating agent profile: {}", agentId);
        
        DeliveryAgent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Delivery agent not found"));
        
        if (request.getFullName() != null) agent.setFullName(request.getFullName());
        if (request.getPhone() != null) agent.setPhone(request.getPhone());
        if (request.getEmail() != null) agent.setEmail(request.getEmail());
        if (request.getVehicleType() != null) agent.setVehicleType(request.getVehicleType());
        if (request.getVehicleNumber() != null) agent.setVehicleNumber(request.getVehicleNumber());
        if (request.getLicenseNumber() != null) agent.setLicenseNumber(request.getLicenseNumber());
        if (request.getAadharNumber() != null) agent.setAadharNumber(request.getAadharNumber());
        
        DeliveryAgent updated = agentRepository.save(agent);
        log.info("Agent profile updated: {}", agentId);
        
        return mapToDTO(updated);
    }

    private DeliveryAgentDTO mapToDTO(DeliveryAgent agent) {
        return DeliveryAgentDTO.builder()
                .id(agent.getId())
                .userId(agent.getUserId())
                .fullName(agent.getFullName())
                .phone(agent.getPhone())
                .email(agent.getEmail())
                .vehicleType(agent.getVehicleType())
                .vehicleNumber(agent.getVehicleNumber())
                .licenseNumber(agent.getLicenseNumber())
                .aadharNumber(agent.getAadharNumber())
                .isVerified(agent.getIsVerified())
                .isActive(agent.getIsActive())
                .isOnline(agent.getIsOnline())
                .currentLatitude(agent.getCurrentLatitude())
                .currentLongitude(agent.getCurrentLongitude())
                .totalDeliveries(agent.getTotalDeliveries())
                .totalEarnings(agent.getTotalEarnings())
                .todayEarnings(agent.getTodayEarnings())
                .todayDeliveries(agent.getTodayDeliveries())
                .averageRating(agent.getAverageRating())
                .createdAt(agent.getCreatedAt())
                .build();
    }
}
