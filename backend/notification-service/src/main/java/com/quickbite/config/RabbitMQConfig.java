package com.quickbite.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Exchange names
    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String PAYMENT_EXCHANGE = "payment.exchange";

    // Queue names
    public static final String NOTIFICATION_QUEUE = "quickbite.notification.queue";
    public static final String ORDER_NOTIFICATION_QUEUE = "quickbite.order.notification.queue";
    public static final String PAYMENT_NOTIFICATION_QUEUE = "quickbite.payment.notification.queue";
    public static final String EMAIL_QUEUE = "quickbite.email.queue";
    public static final String SMS_QUEUE = "quickbite.sms.queue";

    // Routing keys
    public static final String NOTIFICATION_ROUTING_KEY = "notification.#";
    public static final String ORDER_ROUTING_KEY = "order.#";
    public static final String PAYMENT_ROUTING_KEY = "payment.#";

    // Exchange Declarations
    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE, true, false);
    }

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE, true, false);
    }

    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(PAYMENT_EXCHANGE, true, false);
    }

    // Queue Declarations
    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE, true, false, false);
    }

    @Bean
    public Queue orderNotificationQueue() {
        return new Queue(ORDER_NOTIFICATION_QUEUE, true, false, false);
    }

    @Bean
    public Queue paymentNotificationQueue() {
        return new Queue(PAYMENT_NOTIFICATION_QUEUE, true, false, false);
    }

    @Bean
    public Queue emailQueue() {
        return new Queue(EMAIL_QUEUE, true, false, false);
    }

    @Bean
    public Queue smsQueue() {
        return new Queue(SMS_QUEUE, true, false, false);
    }

    // Bindings
    @Bean
    public Binding notificationBinding(@Qualifier("notificationQueue") Queue notificationQueue, 
                                       @Qualifier("notificationExchange") TopicExchange notificationExchange) {
        return BindingBuilder.bind(notificationQueue)
                .to(notificationExchange)
                .with(NOTIFICATION_ROUTING_KEY);
    }

    @Bean
    public Binding orderNotificationBinding(@Qualifier("orderNotificationQueue") Queue orderNotificationQueue, 
                                            @Qualifier("orderExchange") TopicExchange orderExchange) {
        return BindingBuilder.bind(orderNotificationQueue)
                .to(orderExchange)
                .with(ORDER_ROUTING_KEY);
    }

    @Bean
    public Binding paymentNotificationBinding(@Qualifier("paymentNotificationQueue") Queue paymentNotificationQueue, 
                                              @Qualifier("paymentExchange") TopicExchange paymentExchange) {
        return BindingBuilder.bind(paymentNotificationQueue)
                .to(paymentExchange)
                .with(PAYMENT_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jackson2MessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jackson2MessageConverter());
        return template;
    }
}
