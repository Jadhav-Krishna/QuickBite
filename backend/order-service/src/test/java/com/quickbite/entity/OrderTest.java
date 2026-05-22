package com.quickbite.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;

class OrderTest {

    @Test
    void addAndRemoveItemMaintainsRelationship() {
        Order order = new Order();
        order.setItems(new ArrayList<>());
        OrderItem item = new OrderItem();

        order.addItem(item);

        assertEquals(1, order.getItems().size());
        assertSame(order, item.getOrder());

        order.removeItem(item);

        assertEquals(0, order.getItems().size());
        assertNull(item.getOrder());
    }

    @Test
    void lifecycleCallbacksSetTimestamps() {
        Order order = new Order();

        order.onCreate();
        LocalDateTime createdAt = order.getCreatedAt();

        assertNotNull(createdAt);
        assertNotNull(order.getUpdatedAt());

        order.onUpdate();

        assertEquals(createdAt, order.getCreatedAt());
        assertNotNull(order.getUpdatedAt());
    }
}
