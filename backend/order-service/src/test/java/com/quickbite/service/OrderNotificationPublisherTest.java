package com.quickbite.service;

import com.quickbite.event.OrderEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.Map;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderNotificationPublisherTest {

    @Mock private RabbitTemplate rabbitTemplate;

    @InjectMocks private OrderNotificationPublisher publisher;

    @Test
    void handleOrderEvent_customerOnly() {
        OrderEvent event = OrderEvent.builder()
                .orderId(1L)
                .customerId(1L)
                .restaurantId(2L)
                .eventType("ORDER_DELIVERED")
                .orderNumber("ORD-1")
                .totalAmount(100.0)
                .build();

        publisher.handleOrderEvent(event);

        verify(rabbitTemplate, times(1)).convertAndSend(anyString(), anyString(), any(Map.class));
    }

    @Test
    void handleOrderEvent_restaurantAlso() {
        OrderEvent event = OrderEvent.builder()
                .orderId(1L)
                .customerId(1L)
                .restaurantId(2L)
                .eventType("ORDER_PLACED")
                .orderNumber("ORD-1")
                .build();

        publisher.handleOrderEvent(event);

        verify(rabbitTemplate, times(2)).convertAndSend(anyString(), anyString(), any(Map.class));
    }

    @Test
    void handleOrderEvent_confirmed() {
        OrderEvent event = OrderEvent.builder()
                .orderId(1L)
                .customerId(1L)
                .restaurantId(2L)
                .eventType("ORDER_CONFIRMED")
                .orderNumber("ORD-1")
                .build();

        publisher.handleOrderEvent(event);

        verify(rabbitTemplate, times(2)).convertAndSend(anyString(), anyString(), any(Map.class));
    }

    @Test
    void handleOrderEvent_cancelled() {
        OrderEvent event = OrderEvent.builder()
                .orderId(1L)
                .customerId(1L)
                .restaurantId(2L)
                .eventType("ORDER_CANCELLED")
                .orderNumber("ORD-1")
                .build();

        publisher.handleOrderEvent(event);

        verify(rabbitTemplate, times(2)).convertAndSend(anyString(), anyString(), any(Map.class));
    }

    @Test
    void handleOrderEvent_preparing() {
        OrderEvent event = OrderEvent.builder()
                .orderId(1L)
                .customerId(1L)
                .restaurantId(2L)
                .eventType("ORDER_PREPARING")
                .orderNumber("ORD-1")
                .build();

        publisher.handleOrderEvent(event);

        verify(rabbitTemplate, times(1)).convertAndSend(anyString(), anyString(), any(Map.class));
    }

    @Test
    void handleOrderEvent_ready() {
        OrderEvent event = OrderEvent.builder()
                .orderId(1L)
                .customerId(1L)
                .restaurantId(2L)
                .eventType("ORDER_READY")
                .orderNumber("ORD-1")
                .build();

        publisher.handleOrderEvent(event);

        verify(rabbitTemplate, times(1)).convertAndSend(anyString(), anyString(), any(Map.class));
    }

    @Test
    void handleOrderEvent_pickedUp() {
        OrderEvent event = OrderEvent.builder()
                .orderId(1L)
                .customerId(1L)
                .restaurantId(2L)
                .eventType("ORDER_PICKED_UP")
                .orderNumber("ORD-1")
                .build();

        publisher.handleOrderEvent(event);

        verify(rabbitTemplate, times(1)).convertAndSend(anyString(), anyString(), any(Map.class));
    }

    @Test
    void handleOrderEvent_inTransit() {
        OrderEvent event = OrderEvent.builder()
                .orderId(1L)
                .customerId(1L)
                .restaurantId(2L)
                .eventType("ORDER_IN_TRANSIT")
                .orderNumber("ORD-1")
                .build();

        publisher.handleOrderEvent(event);

        verify(rabbitTemplate, times(1)).convertAndSend(anyString(), anyString(), any(Map.class));
    }

    @Test
    void handleOrderEvent_agentAssigned() {
        OrderEvent event = OrderEvent.builder()
                .orderId(1L)
                .customerId(1L)
                .restaurantId(2L)
                .eventType("DELIVERY_AGENT_ASSIGNED")
                .orderNumber("ORD-1")
                .build();

        publisher.handleOrderEvent(event);

        verify(rabbitTemplate, times(1)).convertAndSend(anyString(), anyString(), any(Map.class));
    }

    @Test
    void handleOrderEvent_paymentSuccess() {
        OrderEvent event = OrderEvent.builder()
                .orderId(1L)
                .customerId(1L)
                .restaurantId(2L)
                .eventType("PAYMENT_SUCCESS")
                .orderNumber("ORD-1")
                .totalAmount(100.0)
                .build();

        publisher.handleOrderEvent(event);

        verify(rabbitTemplate, times(1)).convertAndSend(anyString(), anyString(), any(Map.class));
    }

    @Test
    void handleOrderEvent_paymentFailed() {
        OrderEvent event = OrderEvent.builder()
                .orderId(1L)
                .customerId(1L)
                .restaurantId(2L)
                .eventType("PAYMENT_FAILED")
                .orderNumber("ORD-1")
                .build();

        publisher.handleOrderEvent(event);

        verify(rabbitTemplate, times(1)).convertAndSend(anyString(), anyString(), any(Map.class));
    }

    @Test
    void handleOrderEvent_error() {
        OrderEvent event = OrderEvent.builder()
                .orderId(1L)
                .customerId(1L)
                .restaurantId(2L)
                .eventType("ORDER_DELIVERED")
                .orderNumber("ORD-1")
                .build();

        doThrow(new RuntimeException("RabbitMQ error"))
            .when(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Map.class));

        publisher.handleOrderEvent(event);

        verify(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Map.class));
    }
}
