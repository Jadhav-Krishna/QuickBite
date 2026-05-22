package com.quickbite.util;

import com.quickbite.config.RabbitMQConfig;
import com.quickbite.event.NotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class NotificationPublisher {
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public void publishNotification(NotificationEvent event) {
        try {
            log.info("Publishing notification to RabbitMQ: {}", event);
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                event
            );
            log.info("Notification published successfully");
        } catch (Exception e) {
            log.error("Failed to publish notification: {}", e.getMessage(), e);
        }
    }
}
