package com.quickbite.controller;

import com.quickbite.dto.CartDTO;
import com.quickbite.dto.CartItemDTO;
import com.quickbite.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartControllerTest {

    @Mock
    private CartService cartService;

    @InjectMocks
    private CartController cartController;

    private CartDTO cart;

    @BeforeEach
    void setUp() {
        cart = CartDTO.builder()
                .id(1L)
                .customerId(10L)
                .restaurantId(20L)
                .items(List.of())
                .totalItems(0)
                .totalPrice(0.0)
                .isActive(true)
                .build();
    }

    @Test
    void getCart_returnsCart() {
        when(cartService.getCart(10L)).thenReturn(cart);

        ResponseEntity<CartDTO> response = cartController.getCart(10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(cart, response.getBody());
    }

    @Test
    void createCart_returnsCreatedCart() {
        when(cartService.getOrCreateCart(10L, 20L)).thenReturn(cart);

        ResponseEntity<CartDTO> response = cartController.createCart(10L, 20L);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertSame(cart, response.getBody());
    }

    @Test
    void addItemToCart_returnsCreatedCart() {
        CartItemDTO item = CartItemDTO.builder()
                .menuItemId(5L)
                .itemName("Pizza")
                .quantity(2)
                .price(100.0)
                .build();
        when(cartService.addItemToCart(10L, 20L, item)).thenReturn(cart);

        ResponseEntity<CartDTO> response = cartController.addItemToCart(10L, 20L, item);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertSame(cart, response.getBody());
    }

    @Test
    void updateCartItem_returnsUpdatedCart() {
        when(cartService.updateCartItem(10L, 20L, 30L, 4)).thenReturn(cart);

        ResponseEntity<CartDTO> response = cartController.updateCartItem(10L, 20L, 30L, 4);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(cart, response.getBody());
    }

    @Test
    void removeItemFromCart_returnsUpdatedCart() {
        when(cartService.removeItemFromCart(10L, 20L, 30L)).thenReturn(cart);

        ResponseEntity<CartDTO> response = cartController.removeItemFromCart(10L, 20L, 30L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(cart, response.getBody());
    }

    @Test
    void clearCart_returnsClearedCart() {
        when(cartService.clearCart(10L)).thenReturn(cart);

        ResponseEntity<CartDTO> response = cartController.clearCart(10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(cart, response.getBody());
    }

    @Test
    void switchRestaurant_returnsNewCart() {
        when(cartService.switchRestaurant(10L, 25L)).thenReturn(cart);

        ResponseEntity<CartDTO> response = cartController.switchRestaurant(10L, 25L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(cart, response.getBody());
    }

    @Test
    void deleteCart_returnsNoContent() {
        ResponseEntity<Void> response = cartController.deleteCart(10L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(cartService).deleteCart(10L);
    }

    @Test
    void applyPromoCode_returnsDiscountedCart() {
        when(cartService.applyPromoCode(10L, "DISCOUNT10")).thenReturn(cart);

        ResponseEntity<CartDTO> response = cartController.applyPromoCode(10L, "DISCOUNT10");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(cart, response.getBody());
    }

    @Test
    void getAllCarts_returnsList() {
        when(cartService.getAllCarts()).thenReturn(List.of(cart));

        ResponseEntity<List<CartDTO>> response = cartController.getAllCarts();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(List.of(cart), response.getBody());
    }

    @Test
    void getCartTotal_returnsTotal() {
        when(cartService.cartTotal(10L)).thenReturn(125.5);

        ResponseEntity<Double> response = cartController.getCartTotal(10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(125.5, response.getBody());
    }
}
