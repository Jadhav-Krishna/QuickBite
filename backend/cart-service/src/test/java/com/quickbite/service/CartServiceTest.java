package com.quickbite.service;

import com.quickbite.dto.CartDTO;
import com.quickbite.dto.CartItemDTO;
import com.quickbite.entity.CartItem;
import com.quickbite.entity.ShoppingCart;
import com.quickbite.repository.CartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @InjectMocks
    private CartService cartService;

    private ShoppingCart testCart;
    private CartItem testCartItem;

    @BeforeEach
    void setUp() {
        testCart = new ShoppingCart();
        testCart.setId(1L);
        testCart.setCustomerId(1L);
        testCart.setRestaurantId(1L);
        testCart.setItems(new ArrayList<>());
        testCart.setTotalPrice(0.0);
        testCart.setTotalItems(0);
        testCart.setIsActive(true);

        testCartItem = new CartItem();
        testCartItem.setId(1L);
        testCartItem.setMenuItemId(1L);
        testCartItem.setItemName("Test Item");
        testCartItem.setQuantity(2);
        testCartItem.setPrice(10.0);
    }

    @Test
    void getCartByUserId_Success() {
        when(cartRepository.findByCustomerIdAndIsActiveTrue(anyLong())).thenReturn(Optional.of(testCart));

        CartDTO result = cartService.getCart(1L);

        assertNotNull(result);
        assertEquals(1L, result.getCustomerId());
        verify(cartRepository).findByCustomerIdAndIsActiveTrue(1L);
    }

    @Test
    void addItemToCart_Success() {
        when(cartRepository.findByCustomerIdAndRestaurantIdAndIsActiveTrue(anyLong(), anyLong()))
                .thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(ShoppingCart.class))).thenReturn(testCart);

        CartItemDTO itemDTO = new CartItemDTO();
        itemDTO.setMenuItemId(1L);
        itemDTO.setItemName("Test Item");
        itemDTO.setQuantity(2);
        itemDTO.setPrice(10.0);

        CartDTO result = cartService.addItemToCart(1L, 1L, itemDTO);

        assertNotNull(result);
        verify(cartRepository).save(any(ShoppingCart.class));
    }

    @Test
    void removeItemFromCart_Success() {
        testCart.getItems().add(testCartItem);
        testCartItem.setCart(testCart);
        when(cartRepository.findByCustomerIdAndRestaurantIdAndIsActiveTrue(anyLong(), anyLong()))
                .thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(ShoppingCart.class))).thenReturn(testCart);

        cartService.removeItemFromCart(1L, 1L, 1L);

        verify(cartRepository).save(any(ShoppingCart.class));
    }

    @Test
    void clearCart_Success() {
        when(cartRepository.findByCustomerIdAndIsActiveTrue(anyLong())).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(ShoppingCart.class))).thenReturn(testCart);

        cartService.clearCart(1L);

        verify(cartRepository).save(argThat(cart -> cart.getItems().isEmpty()));
    }

    @Test
    void updateItemQuantity_Success() {
        testCart.getItems().add(testCartItem);
        testCartItem.setCart(testCart);
        when(cartRepository.findByCustomerIdAndRestaurantIdAndIsActiveTrue(anyLong(), anyLong()))
                .thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(ShoppingCart.class))).thenReturn(testCart);

        cartService.updateCartItem(1L, 1L, 1L, 5);

        verify(cartRepository).save(any(ShoppingCart.class));
    }
}
