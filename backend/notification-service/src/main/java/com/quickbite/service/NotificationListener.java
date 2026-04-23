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
            notificationService.processOrderEvent(eventData);
        } catch (Exception e) {
            log.error("Failed to process order event", e);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void handleGeneralNotification(Object payload) {
        log.info("Received general notification payload: {}", payload);
        try {
            if (payload instanceof NotificationEvent event) {
                notificationService.processNotification(event);
                return;
            }

            if (payload instanceof Map<?, ?> map) {
                NotificationEvent event = NotificationEvent.builder()
                        .eventType((String) map.get("eventType"))
                        .orderId(map.get("orderId") instanceof Number n ? n.longValue() : null)
                        .userId(map.get("userId") instanceof Number n ? n.longValue() : null)
                        .customerId(map.get("customerId") instanceof Number n ? n.longValue() : null)
                        .restaurantId(map.get("restaurantId") instanceof Number n ? n.longValue() : null)
                        .deliveryAgentId(map.get("deliveryAgentId") instanceof Number n ? n.longValue() : null)
                        .title((String) map.get("title"))
                        .message((String) map.get("message"))
                        .notificationType((String) map.get("notificationType"))
                        .recipientEmail((String) map.get("recipientEmail"))
                        .recipientPhone((String) map.get("recipientPhone"))
                        .recipientRole((String) map.get("recipientRole"))
                        .build();
                notificationService.processNotification(event);
            }
        } catch (Exception e) {
            log.error("Failed to process general notification", e);
        }
    }
}
