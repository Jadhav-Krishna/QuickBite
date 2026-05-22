package com.quickbite.event;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OrderEventTest {

    @Test
    void builderAndDataMethodsWork() {
        LocalDateTime now = LocalDateTime.now();
        OrderEvent event = OrderEvent.builder()
                .eventId("event-1")
                .eventType(OrderEvent.EventType.ORDER_PLACED.name())
                .orderId(1L)
                .orderNumber("ORD-1")
                .customerId(2L)
                .restaurantId(3L)
                .orderStatus("PLACED")
                .totalAmount(100.0)
                .paymentMethod("UPI")
                .timestamp(now)
                .message("Placed")
                .build();

        assertEquals("event-1", event.getEventId());
        assertTrue(event.toString().contains("ORD-1"));
        assertEquals(event, new OrderEvent(
                "event-1",
                OrderEvent.EventType.ORDER_PLACED.name(),
                1L,
                "ORD-1",
                2L,
                3L,
                "PLACED",
                100.0,
                "UPI",
                now,
                "Placed"
        ));
    }
}
