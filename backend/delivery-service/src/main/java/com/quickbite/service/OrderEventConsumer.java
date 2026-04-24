package com.quickbite.service;

import com.quickbite.config.KafkaConfig;
import com.quickbite.config.RabbitMQConfig;
import com.quickbite.event.DeliveryStatusEvent;
import com.quickbite.event.OrderEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
public class OrderEventConsumer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    public OrderEventConsumer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @RabbitListener(queues = RabbitMQConfig.DELIVERY_ORDER_EVENTS_QUEUE)
    public void consumeOrderEvent(OrderEvent event) {
        if (event == null || event.getOrderId() == null) {
            return;
        }

        log.info("Received order event from RabbitMQ: {} for order {}", event.getEventType(), event.getOrderNumber());

        DeliveryStatusEvent statusEvent = DeliveryStatusEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .orderId(event.getOrderId())
                .orderNumber(event.getOrderNumber())
                .eventType(event.getEventType())
                .orderStatus(event.getOrderStatus())
                .message(event.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        kafkaTemplate.send(KafkaConfig.DELIVERY_STATUS_TOPIC, String.valueOf(event.getOrderId()), statusEvent);
    }
}
