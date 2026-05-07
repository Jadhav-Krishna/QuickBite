package com.quickbite.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ShoppingCartTest {

    @Test
    void addRemoveAndClearItemsMaintainTotalsAndRelationships() {
        ShoppingCart cart = new ShoppingCart();
        cart.setItems(new ArrayList<>());

        CartItem first = item(1L, 2, 75.0);
        CartItem second = item(2L, 1, 50.0);

        cart.addItem(first);
        cart.addItem(second);

        assertSame(cart, first.getCart());
        assertEquals(3, cart.getTotalItems());
        assertEquals(200.0, cart.getTotalPrice());

        cart.removeItem(first);

        assertNull(first.getCart());
        assertEquals(1, cart.getTotalItems());
        assertEquals(50.0, cart.getTotalPrice());

        cart.clear();

        assertTrue(cart.getItems().isEmpty());
        assertEquals(0, cart.getTotalItems());
        assertEquals(0.0, cart.getTotalPrice());
    }

    @Test
    void lifecycleCallbacksSetTimestamps() {
        ShoppingCart cart = new ShoppingCart();

        cart.onCreate();
        LocalDateTime createdAt = cart.getCreatedAt();
        LocalDateTime updatedAt = cart.getUpdatedAt();

        assertNotNull(createdAt);
        assertNotNull(updatedAt);

        cart.onUpdate();

        assertEquals(createdAt, cart.getCreatedAt());
        assertNotNull(cart.getUpdatedAt());
    }

    private CartItem item(Long menuItemId, int quantity, double price) {
        CartItem item = new CartItem();
        item.setMenuItemId(menuItemId);
        item.setItemName("Item " + menuItemId);
        item.setQuantity(quantity);
        item.setPrice(price);
        return item;
    }
}
