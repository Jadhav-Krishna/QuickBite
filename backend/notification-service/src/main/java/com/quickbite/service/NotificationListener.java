package com.quickbite.service;

import com.quickbite.config.RabbitMQConfig;
import com.quickbite.event.NotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
public class NotificationListener {

    @Autowired
    private NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.ORDER_NOTIFICATION_QUEUE)
    public void handleOrderEvent(Map<String, Object> eventData) {
        log.info("Received order event: {}", eventData);
        try {
            NotificationEvent notificationEvent = NotificationEvent.builder()
                    .eventType((String) eventData.get("eventType"))
                    .orderId(((Number) eventData.get("orderId")).longValue())
                    .customerId(eventData.get("customerId") != null ? ((Number) eventData.get("customerId")).longValue() : null)
                    .restaurantId(eventData.get("restaurantId") != null ? ((Number) eventData.get("restaurantId")).longValue() : null)
                    .title("Order Update: " + eventData.get("orderNumber"))
                    .message((String) eventData.get("message"))
                    .build();

            notificationService.processNotification(notificationEvent);
        } catch (Exception e) {
            log.error("Failed to process order event", e);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void handleGeneralNotification(NotificationEvent event) {
        log.info("Received general notification event: {}", event);
        try {
            notificationService.processNotification(event);
        } catch (Exception e) {
            log.error("Failed to process general notification", e);
        }
    }
}
