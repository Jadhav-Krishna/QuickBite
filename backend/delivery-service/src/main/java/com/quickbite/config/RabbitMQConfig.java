package com.quickbite.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String DELIVERY_ORDER_EVENTS_QUEUE = "delivery.order.events.queue";
    public static final String ORDER_ROUTING_KEY = "order.#";

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE, true, false);
    }

    @Bean
    public Queue deliveryOrderEventsQueue() {
        return new Queue(DELIVERY_ORDER_EVENTS_QUEUE, true);
    }

    @Bean
    public Binding deliveryOrderEventsBinding(Queue deliveryOrderEventsQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(deliveryOrderEventsQueue)
                .to(orderExchange)
                .with(ORDER_ROUTING_KEY);
    }

    @Bean
    public org.springframework.amqp.support.converter.MessageConverter jackson2MessageConverter() {
        return new org.springframework.amqp.support.converter.Jackson2JsonMessageConverter();
    }
}
