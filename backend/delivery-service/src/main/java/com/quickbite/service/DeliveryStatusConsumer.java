package com.quickbite.service;

import com.quickbite.event.DeliveryStatusEvent;
import com.quickbite.websocket.TrackingWebSocketHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class DeliveryStatusConsumer {

    private final TrackingWebSocketHandler trackingWebSocketHandler;

    @Autowired
    public DeliveryStatusConsumer(TrackingWebSocketHandler trackingWebSocketHandler) {
        this.trackingWebSocketHandler = trackingWebSocketHandler;
    }

    @KafkaListener(topics = "delivery.status.updates", groupId = "quickbite-delivery-group")
    public void consumeDeliveryStatus(DeliveryStatusEvent event) {
        if (event == null || event.getOrderId() == null) {
            return;
        }

        log.info("Received delivery status from Kafka for order {} status {}", event.getOrderId(), event.getOrderStatus());
        trackingWebSocketHandler.broadcastStatus(String.valueOf(event.getOrderId()), event);
    }
}
