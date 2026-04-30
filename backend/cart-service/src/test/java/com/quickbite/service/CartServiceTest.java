package com.quickbite.service;

import com.quickbite.dto.CartDTO;
import com.quickbite.dto.CartItemDTO;
import com.quickbite.entity.Cart;
import com.quickbite.entity.CartItem;
import com.quickbite.repository.CartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @InjectMocks
    private CartService cartService;

    private Cart testCart;
    private CartItem testCartItem;

    @BeforeEach
    void setUp() {
        testCart = new Cart();
        testCart.setId(1L);
        testCart.setUserId(1L);
        testCart.setRestaurantId(1L);
        testCart.setItems(new ArrayList<>());

        testCartItem = new CartItem();
        testCartItem.setId(1L);
        testCartItem.setMenuItemId(1L);
        testCartItem.setQuantity(2);
        testCartItem.setPrice(new BigDecimal("10.00"));
    }

    @Test
    void getCartByUserId_Success() {
        when(cartRepository.findByUserId(anyLong())).thenReturn(Optional.of(testCart));

        CartDTO result = cartService.getCartByUserId(1L);

        assertNotNull(result);
        assertEquals(1L, result.getUserId());
        verify(cartRepository).findByUserId(1L);
    }

    @Test
    void addItemToCart_Success() {
        when(cartRepository.findByUserId(anyLong())).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        CartItemDTO itemDTO = new CartItemDTO();
        itemDTO.setMenuItemId(1L);
        itemDTO.setQuantity(2);
        itemDTO.setPrice(new BigDecimal("10.00"));

        CartDTO result = cartService.addItemToCart(1L, itemDTO);

        assertNotNull(result);
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void removeItemFromCart_Success() {
        testCart.getItems().add(testCartItem);
        when(cartRepository.findByUserId(anyLong())).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        cartService.removeItemFromCart(1L, 1L);

        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void clearCart_Success() {
        when(cartRepository.findByUserId(anyLong())).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        cartService.clearCart(1L);

        verify(cartRepository).save(argThat(cart -> cart.getItems().isEmpty()));
    }

    @Test
    void updateItemQuantity_Success() {
        testCart.getItems().add(testCartItem);
        when(cartRepository.findByUserId(anyLong())).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        cartService.updateItemQuantity(1L, 1L, 5);

        verify(cartRepository).save(any(Cart.class));
    }
}
