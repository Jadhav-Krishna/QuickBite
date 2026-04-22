package com.quickbite.service;

import com.quickbite.event.LocationUpdateEvent;
import com.quickbite.websocket.TrackingWebSocketHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class LocationEventConsumer {

    private final TrackingWebSocketHandler trackingWebSocketHandler;

    @Autowired
    public LocationEventConsumer(TrackingWebSocketHandler trackingWebSocketHandler) {
        this.trackingWebSocketHandler = trackingWebSocketHandler;
    }

    @KafkaListener(topics = "delivery.location.updates", groupId = "quickbite-delivery-group")
    public void consumeLocationUpdate(LocationUpdateEvent event) {
        log.info("Received location update from Kafka for agent {}, order {}", 
                 event.getDeliveryAgentId(), event.getOrderId());
                 
        if (event.getOrderId() != null) {
            // Push the event directly to connected WebSockets for this order
            trackingWebSocketHandler.broadcastLocation(String.valueOf(event.getOrderId()), event);
        }
    }
}
