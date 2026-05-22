package com.quickbite.config;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.MessageConverter;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class RabbitMQConfigTest {

    private final RabbitMQConfig config = new RabbitMQConfig();

    @Test
    void notificationExchange_created() {
        TopicExchange exchange = config.notificationExchange();

        assertNotNull(exchange);
        assertEquals("notification.exchange", exchange.getName());
        assertTrue(exchange.isDurable());
        assertFalse(exchange.isAutoDelete());
    }

    @Test
    void jackson2MessageConverter_created() {
        MessageConverter converter = config.jackson2MessageConverter();

        assertNotNull(converter);
    }

    @Test
    void rabbitTemplate_created() {
        ConnectionFactory factory = mock(ConnectionFactory.class);

        RabbitTemplate template = config.rabbitTemplate(factory);

        assertNotNull(template);
    }
}
