package com.quickbite.config;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RabbitMQConfigTest {

    private final RabbitMQConfig config = new RabbitMQConfig();

    @Test
    void orderExchangeIsDurableTopicExchange() {
        TopicExchange exchange = config.orderExchange();

        assertEquals(RabbitMQConfig.ORDER_EXCHANGE, exchange.getName());
        assertTrue(exchange.isDurable());
        assertFalse(exchange.isAutoDelete());
    }

    @Test
    void orderQueueIsDurable() {
        Queue queue = config.orderQueue();

        assertEquals(RabbitMQConfig.ORDER_QUEUE, queue.getName());
        assertTrue(queue.isDurable());
    }

    @Test
    void orderBindingUsesConfiguredRoutingKey() {
        Binding binding = config.orderBinding(config.orderQueue(), config.orderExchange());

        assertEquals(RabbitMQConfig.ORDER_ROUTING_KEY, binding.getRoutingKey());
        assertEquals(RabbitMQConfig.ORDER_QUEUE, binding.getDestination());
        assertEquals(RabbitMQConfig.ORDER_EXCHANGE, binding.getExchange());
    }

    @Test
    void messageConverterUsesJacksonJson() {
        assertInstanceOf(Jackson2JsonMessageConverter.class, config.jackson2MessageConverter());
    }
}
