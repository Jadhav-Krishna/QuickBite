package com.quickbite.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class OrderItemTest {

    @Test
    void getItemTotalMultipliesPriceAndQuantity() {
        OrderItem item = new OrderItem();
        item.setPrice(12.5);
        item.setQuantity(4);

        assertEquals(50.0, item.getItemTotal());
    }

    @Test
    void onCreateSetsCreatedAt() {
        OrderItem item = new OrderItem();

        item.onCreate();

        assertNotNull(item.getCreatedAt());
    }
}
