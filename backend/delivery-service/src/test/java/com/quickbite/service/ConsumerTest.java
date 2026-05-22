package com.quickbite.service;

import com.quickbite.event.DeliveryStatusEvent;
import com.quickbite.event.LocationUpdateEvent;
import com.quickbite.event.OrderEvent;
import com.quickbite.websocket.TrackingWebSocketHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConsumerTest {

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Mock
    private TrackingWebSocketHandler trackingWebSocketHandler;

    @InjectMocks
    private OrderEventConsumer orderEventConsumer;

    @InjectMocks
    private DeliveryStatusConsumer deliveryStatusConsumer;

    @InjectMocks
    private LocationEventConsumer locationEventConsumer;

    @Test
    void orderEventConsumer_success() {
        OrderEvent event = new OrderEvent();
        event.setOrderId(1L);
        event.setOrderNumber("ORD-001");
        event.setEventType("ORDER_PLACED");

        orderEventConsumer.consumeOrderEvent(event);

        verify(kafkaTemplate).send(anyString(), anyString(), any());
    }

    @Test
    void orderEventConsumer_nullEvent() {
        orderEventConsumer.consumeOrderEvent(null);

        verify(kafkaTemplate, never()).send(anyString(), anyString(), any());
    }

    @Test
    void orderEventConsumer_nullOrderId() {
        OrderEvent event = new OrderEvent();
        event.setOrderNumber("ORD-001");

        orderEventConsumer.consumeOrderEvent(event);

        verify(kafkaTemplate, never()).send(anyString(), anyString(), any());
    }

    @Test
    void deliveryStatusConsumer_success() {
        DeliveryStatusEvent event = new DeliveryStatusEvent();
        event.setOrderId(1L);
        event.setOrderStatus("DELIVERED");

        deliveryStatusConsumer.consumeDeliveryStatus(event);

        verify(trackingWebSocketHandler).broadcastStatus(anyString(), any());
    }

    @Test
    void deliveryStatusConsumer_nullEvent() {
        deliveryStatusConsumer.consumeDeliveryStatus(null);

        verify(trackingWebSocketHandler, never()).broadcastStatus(anyString(), any());
    }

    @Test
    void deliveryStatusConsumer_nullOrderId() {
        DeliveryStatusEvent event = new DeliveryStatusEvent();
        event.setOrderStatus("DELIVERED");

        deliveryStatusConsumer.consumeDeliveryStatus(event);

        verify(trackingWebSocketHandler, never()).broadcastStatus(anyString(), any());
    }

    @Test
    void locationEventConsumer_success() {
        LocationUpdateEvent event = new LocationUpdateEvent();
        event.setDeliveryAgentId(1L);
        event.setOrderId(10L);
        event.setLatitude(22.7);
        event.setLongitude(75.8);

        locationEventConsumer.consumeLocationUpdate(event);

        verify(trackingWebSocketHandler).broadcastLocation(anyString(), any());
    }

    @Test
    void locationEventConsumer_nullOrderId() {
        LocationUpdateEvent event = new LocationUpdateEvent();
        event.setDeliveryAgentId(1L);
        event.setLatitude(22.7);
        event.setLongitude(75.8);

        locationEventConsumer.consumeLocationUpdate(event);

        verify(trackingWebSocketHandler, never()).broadcastLocation(anyString(), any());
    }
}
