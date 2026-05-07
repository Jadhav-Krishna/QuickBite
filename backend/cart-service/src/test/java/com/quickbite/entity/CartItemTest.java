package com.quickbite.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class CartItemTest {

    @Test
    void getItemTotalMultipliesPriceAndQuantity() {
        CartItem item = new CartItem();
        item.setPrice(25.5);
        item.setQuantity(4);

        assertEquals(102.0, item.getItemTotal());
    }

    @Test
    void lifecycleCallbacksSetTimestamps() {
        CartItem item = new CartItem();

        item.onCreate();
        LocalDateTime createdAt = item.getCreatedAt();

        assertNotNull(createdAt);
        assertNotNull(item.getUpdatedAt());

        item.onUpdate();

        assertEquals(createdAt, item.getCreatedAt());
        assertNotNull(item.getUpdatedAt());
    }
}
