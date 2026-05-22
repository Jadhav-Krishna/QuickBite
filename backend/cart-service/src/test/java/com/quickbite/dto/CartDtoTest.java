package com.quickbite.dto;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CartDtoTest {

    @Test
    void cartDtoBuilderAndDataMethodsWork() {
        CartItemDTO item = CartItemDTO.builder()
                .id(1L)
                .menuItemId(2L)
                .itemName("Pizza")
                .quantity(3)
                .price(40.0)
                .specialInstructions("Extra cheese")
                .build();

        CartDTO cart = CartDTO.builder()
                .id(10L)
                .customerId(20L)
                .restaurantId(30L)
                .items(List.of(item))
                .totalPrice(120.0)
                .totalItems(3)
                .isActive(true)
                .build();

        assertEquals(120.0, item.getItemTotal());
        assertEquals(20L, cart.getCustomerId());
        assertTrue(cart.toString().contains("customerId=20"));
        assertEquals(cart, CartDTO.builder()
                .id(10L)
                .customerId(20L)
                .restaurantId(30L)
                .items(List.of(item))
                .totalPrice(120.0)
                .totalItems(3)
                .isActive(true)
                .build());
    }

    @Test
    void addToCartRequestBuilderAndSettersWork() {
        AddToCartRequest request = AddToCartRequest.builder()
                .customerId(1L)
                .restaurantId(2L)
                .menuItemId(3L)
                .quantity(4)
                .price(50.0)
                .build();

        AddToCartRequest changed = new AddToCartRequest();
        changed.setCustomerId(1L);
        changed.setRestaurantId(2L);
        changed.setMenuItemId(3L);
        changed.setQuantity(5);
        changed.setPrice(50.0);

        assertEquals(4, request.getQuantity());
        assertEquals(5, changed.getQuantity());
        assertNotEquals(request, changed);
    }
}
