package com.quickbite.config;

import com.quickbite.websocket.TrackingWebSocketHandler;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class ConfigTest {

    @Test
    void kafkaConfig_producerFactory() {
        KafkaConfig config = new KafkaConfig();
        ReflectionTestUtils.setField(config, "bootstrapServers", "localhost:9092");

        ProducerFactory<String, Object> factory = config.producerFactory();

        assertNotNull(factory);
    }

    @Test
    void kafkaConfig_kafkaTemplate() {
        KafkaConfig config = new KafkaConfig();
        ReflectionTestUtils.setField(config, "bootstrapServers", "localhost:9092");

        KafkaTemplate<String, Object> template = config.kafkaTemplate();

        assertNotNull(template);
    }

    @Test
    void kafkaConfig_consumerFactory() {
        KafkaConfig config = new KafkaConfig();
        ReflectionTestUtils.setField(config, "bootstrapServers", "localhost:9092");

        ConsumerFactory<String, Object> factory = config.consumerFactory();

        assertNotNull(factory);
    }

    @Test
    void kafkaConfig_listenerContainerFactory() {
        KafkaConfig config = new KafkaConfig();
        ReflectionTestUtils.setField(config, "bootstrapServers", "localhost:9092");

        ConcurrentKafkaListenerContainerFactory<String, Object> factory = 
                config.kafkaListenerContainerFactory();

        assertNotNull(factory);
    }

    @Test
    void kafkaConfig_locationUpdatesTopic() {
        KafkaConfig config = new KafkaConfig();

        org.apache.kafka.clients.admin.NewTopic topic = config.locationUpdatesTopic();

        assertNotNull(topic);
        assertEquals("delivery.location.updates", topic.name());
    }

    @Test
    void kafkaConfig_deliveryStatusTopic() {
        KafkaConfig config = new KafkaConfig();

        org.apache.kafka.clients.admin.NewTopic topic = config.deliveryStatusTopic();

        assertNotNull(topic);
        assertEquals("delivery.status.updates", topic.name());
    }

    @Test
    void rabbitMQConfig_orderExchange() {
        RabbitMQConfig config = new RabbitMQConfig();

        TopicExchange exchange = config.orderExchange();

        assertNotNull(exchange);
        assertEquals("order.exchange", exchange.getName());
    }

    @Test
    void rabbitMQConfig_deliveryOrderEventsQueue() {
        RabbitMQConfig config = new RabbitMQConfig();

        Queue queue = config.deliveryOrderEventsQueue();

        assertNotNull(queue);
        assertEquals("delivery.order.events.queue", queue.getName());
    }

    @Test
    void rabbitMQConfig_binding() {
        RabbitMQConfig config = new RabbitMQConfig();
        Queue queue = config.deliveryOrderEventsQueue();
        TopicExchange exchange = config.orderExchange();

        Binding binding = config.deliveryOrderEventsBinding(queue, exchange);

        assertNotNull(binding);
    }

    @Test
    void rabbitMQConfig_messageConverter() {
        RabbitMQConfig config = new RabbitMQConfig();

        MessageConverter converter = config.jackson2MessageConverter();

        assertNotNull(converter);
    }

    @Test
    void webSocketConfig_registerHandlers() {
        TrackingWebSocketHandler handler = mock(TrackingWebSocketHandler.class);
        WebSocketConfig config = new WebSocketConfig(handler);
        ReflectionTestUtils.setField(config, "allowedOrigins", "http://localhost:5173");

        WebSocketHandlerRegistry registry = mock(WebSocketHandlerRegistry.class);
        when(registry.addHandler(any(), anyString())).thenReturn(
                mock(org.springframework.web.socket.config.annotation.WebSocketHandlerRegistration.class));

        config.registerWebSocketHandlers(registry);

        verify(registry).addHandler(any(), eq("/ws/tracking"));
    }
}
