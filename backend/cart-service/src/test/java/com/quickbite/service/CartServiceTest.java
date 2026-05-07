package com.quickbite.service;

import com.quickbite.dto.CartDTO;
import com.quickbite.dto.CartItemDTO;
import com.quickbite.entity.CartItem;
import com.quickbite.entity.ShoppingCart;
import com.quickbite.repository.CartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartRepository cartRepository;
    @Mock private RedisTemplate<String, Object> redisTemplate;
    @Mock private ValueOperations<String, Object> valueOperations;

    @InjectMocks private CartService cartService;

    private ShoppingCart cart;
    private CartItem item;

    @BeforeEach
    void setup() {
        cart = new ShoppingCart();
        cart.setId(1L);
        cart.setCustomerId(1L);
        cart.setRestaurantId(1L);
        cart.setItems(new ArrayList<>());
        cart.setTotalItems(0);
        cart.setTotalPrice(0.0);
        cart.setIsActive(true);

        item = new CartItem();
        item.setId(1L);
        item.setMenuItemId(1L);
        item.setItemName("Pizza");
        item.setQuantity(2);
        item.setPrice(100.0);

        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    // ================= GET OR CREATE =================

    @Test
    void getOrCreateCart_existing() {
        when(cartRepository.findByCustomerIdAndRestaurantIdAndIsActiveTrue(any(), any()))
                .thenReturn(Optional.of(cart));

        CartDTO result = cartService.getOrCreateCart(1L, 1L);

        assertNotNull(result);
        verify(cartRepository, never()).save(any());
    }

    @Test
    void getOrCreateCart_newCart() {
        when(cartRepository.findByCustomerIdAndRestaurantIdAndIsActiveTrue(any(), any()))
                .thenReturn(Optional.empty());
        when(cartRepository.save(any())).thenReturn(cart);

        CartDTO result = cartService.getOrCreateCart(1L, 1L);

        assertNotNull(result);
        verify(cartRepository).save(any());
    }

    // ================= ADD =================

    @Test
    void addItem_success() {
        when(cartRepository.findByCustomerIdAndRestaurantIdAndIsActiveTrue(any(), any()))
                .thenReturn(Optional.of(cart));
        when(cartRepository.save(any())).thenReturn(cart);

        CartItemDTO dto = new CartItemDTO();
        dto.setMenuItemId(1L);
        dto.setItemName("Pizza");
        dto.setQuantity(2);
        dto.setPrice(100.0);

        CartDTO result = cartService.addItemToCart(1L, 1L, dto);

        assertNotNull(result);
        verify(cartRepository).save(any());
    }

    @Test
    void addItem_createsCartWhenMissing() {
        when(cartRepository.findByCustomerIdAndRestaurantIdAndIsActiveTrue(any(), any()))
                .thenReturn(Optional.empty());
        when(cartRepository.save(any(ShoppingCart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CartItemDTO dto = CartItemDTO.builder()
                .menuItemId(2L)
                .itemName("Burger")
                .quantity(3)
                .price(50.0)
                .specialInstructions("No onion")
                .build();

        CartDTO result = cartService.addItemToCart(1L, 2L, dto);

        assertEquals(2L, result.getRestaurantId());
        assertEquals(1, result.getItems().size());
        assertEquals("No onion", result.getItems().getFirst().getSpecialInstructions());
        verify(cartRepository, times(2)).save(any(ShoppingCart.class));
    }

    // ================= UPDATE =================

    @Test
    void updateItem_quantityUpdate() {
        cart.getItems().add(item);

        when(cartRepository.findByCustomerIdAndRestaurantIdAndIsActiveTrue(any(), any()))
                .thenReturn(Optional.of(cart));
        when(cartRepository.save(any())).thenReturn(cart);

        CartDTO result = cartService.updateCartItem(1L, 1L, 1L, 5);

        assertNotNull(result);
        assertEquals(5, item.getQuantity());
    }

    @Test
    void updateItem_removeWhenZero() {
        cart.getItems().add(item);

        when(cartRepository.findByCustomerIdAndRestaurantIdAndIsActiveTrue(any(), any()))
                .thenReturn(Optional.of(cart));
        when(cartRepository.save(any())).thenReturn(cart);

        cartService.updateCartItem(1L, 1L, 1L, 0);

        assertTrue(cart.getItems().isEmpty());
    }

    @Test
    void updateItem_itemNotFound() {
        when(cartRepository.findByCustomerIdAndRestaurantIdAndIsActiveTrue(any(), any()))
                .thenReturn(Optional.of(cart));

        assertThrows(RuntimeException.class,
                () -> cartService.updateCartItem(1L, 1L, 99L, 5));
    }

    @Test
    void updateItem_cartNotFound() {
        when(cartRepository.findByCustomerIdAndRestaurantIdAndIsActiveTrue(any(), any()))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> cartService.updateCartItem(1L, 1L, 1L, 5));

        assertEquals("Cart not found", exception.getMessage());
    }

    // ================= REMOVE =================

    @Test
    void removeItem_success() {
        cart.getItems().add(item);

        when(cartRepository.findByCustomerIdAndRestaurantIdAndIsActiveTrue(any(), any()))
                .thenReturn(Optional.of(cart));
        when(cartRepository.save(any())).thenReturn(cart);

        cartService.removeItemFromCart(1L, 1L, 1L);

        assertTrue(cart.getItems().isEmpty());
    }

    @Test
    void removeItem_cartNotFound() {
        when(cartRepository.findByCustomerIdAndRestaurantIdAndIsActiveTrue(any(), any()))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> cartService.removeItemFromCart(1L, 1L, 1L));

        assertEquals("Cart not found", exception.getMessage());
    }

    @Test
    void removeItem_itemNotFound() {
        when(cartRepository.findByCustomerIdAndRestaurantIdAndIsActiveTrue(any(), any()))
                .thenReturn(Optional.of(cart));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> cartService.removeItemFromCart(1L, 1L, 99L));

        assertEquals("Item not found in cart", exception.getMessage());
    }

    // ================= CLEAR =================

    @Test
    void clearCart_success() {
        cart.getItems().add(item);

        when(cartRepository.findByCustomerIdAndIsActiveTrue(any()))
                .thenReturn(Optional.of(cart));
        when(cartRepository.save(any())).thenReturn(cart);

        cartService.clearCart(1L);

        assertTrue(cart.getItems().isEmpty());
        verify(redisTemplate).delete(anyString());
    }

    @Test
    void clearCart_notFound() {
        when(cartRepository.findByCustomerIdAndIsActiveTrue(any()))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> cartService.clearCart(1L));

        assertEquals("Cart not found", exception.getMessage());
    }

    // ================= SWITCH =================

    @Test
    void switchRestaurant_success() {
        when(cartRepository.findByCustomerIdAndIsActiveTrue(any()))
                .thenReturn(Optional.of(cart));
        
        ShoppingCart updatedCart = new ShoppingCart();
        updatedCart.setId(1L);
        updatedCart.setCustomerId(1L);
        updatedCart.setRestaurantId(2L);
        updatedCart.setItems(new ArrayList<>());
        updatedCart.setTotalItems(0);
        updatedCart.setTotalPrice(0.0);
        updatedCart.setIsActive(true);
        
        when(cartRepository.save(any())).thenReturn(updatedCart);

        CartDTO result = cartService.switchRestaurant(1L, 2L);

        assertNotNull(result);
        assertEquals(2L, result.getRestaurantId());
    }

    @Test
    void switchRestaurant_withoutExistingCart() {
        when(cartRepository.findByCustomerIdAndIsActiveTrue(any()))
                .thenReturn(Optional.empty());
        when(cartRepository.save(any(ShoppingCart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CartDTO result = cartService.switchRestaurant(1L, 3L);

        assertEquals(3L, result.getRestaurantId());
        assertTrue(result.getIsActive());
        verify(cartRepository).save(any(ShoppingCart.class));
    }

    // ================= GET CART =================

    @Test
    void getCart_cacheHit() {
        CartDTO cached = CartDTO.builder().customerId(1L).build();

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(any())).thenReturn(cached);

        CartDTO result = cartService.getCart(1L);

        assertEquals(1L, result.getCustomerId());
        verify(cartRepository, never()).findByCustomerIdAndIsActiveTrue(any());
    }

    @Test
    void getCart_dbFallback() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(any())).thenReturn(null);
        when(cartRepository.findByCustomerIdAndIsActiveTrue(any()))
                .thenReturn(Optional.of(cart));

        CartDTO result = cartService.getCart(1L);

        assertNotNull(result);
    }

    @Test
    void getCart_cacheReadFailureFallsBackToDatabase() {
        when(redisTemplate.opsForValue()).thenThrow(new RuntimeException("Redis down"));
        when(cartRepository.findByCustomerIdAndIsActiveTrue(any()))
                .thenReturn(Optional.of(cart));

        CartDTO result = cartService.getCart(1L);

        assertEquals(1L, result.getCustomerId());
    }

    @Test
    void getCart_notFound() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(any())).thenReturn(null);
        when(cartRepository.findByCustomerIdAndIsActiveTrue(any()))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> cartService.getCart(1L));

        assertEquals("Cart not found", exception.getMessage());
    }

    // ================= DELETE =================

    @Test
    void deleteCart_success() {
        when(cartRepository.findByCustomerId(any()))
                .thenReturn(Optional.of(cart));

        cartService.deleteCart(1L);

        verify(redisTemplate).delete(anyString());
    }

    @Test
    void deleteCart_withoutCartStillClearsCache() {
        when(cartRepository.findByCustomerId(any()))
                .thenReturn(Optional.empty());

        cartService.deleteCart(1L);

        verify(cartRepository, never()).save(any());
        verify(redisTemplate).delete("cart:1");
    }

    @Test
    void deleteCart_ignoresCacheDeleteFailure() {
        when(cartRepository.findByCustomerId(any()))
                .thenReturn(Optional.of(cart));
        doThrow(new RuntimeException("Redis down")).when(redisTemplate).delete(anyString());

        assertDoesNotThrow(() -> cartService.deleteCart(1L));
        verify(cartRepository).save(cart);
    }

    // ================= PROMO =================

    @Test
    void applyPromo_success() {
        cart.setTotalPrice(100.0);

        when(cartRepository.findByCustomerIdAndIsActiveTrue(any()))
                .thenReturn(Optional.of(cart));
        when(cartRepository.save(any())).thenReturn(cart);

        CartDTO result = cartService.applyPromoCode(1L, "DISCOUNT10");

        assertEquals(90.0, result.getTotalPrice());
    }

    @Test
    void applyPromo_invalid() {
        when(cartRepository.findByCustomerIdAndIsActiveTrue(any()))
                .thenReturn(Optional.of(cart));

        assertThrows(RuntimeException.class,
                () -> cartService.applyPromoCode(1L, "INVALID"));
    }

    @Test
    void applyPromo_cartNotFound() {
        when(cartRepository.findByCustomerIdAndIsActiveTrue(any()))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> cartService.applyPromoCode(1L, "DISCOUNT10"));

        assertEquals("Cart not found", exception.getMessage());
    }

    // ================= ALL =================

    @Test
    void getAllCarts_success() {
        ShoppingCart secondCart = new ShoppingCart();
        secondCart.setId(2L);
        secondCart.setCustomerId(2L);
        secondCart.setRestaurantId(3L);
        secondCart.setItems(new ArrayList<>());
        secondCart.setTotalItems(0);
        secondCart.setTotalPrice(0.0);
        secondCart.setIsActive(true);
        when(cartRepository.findAll()).thenReturn(List.of(cart, secondCart));

        List<CartDTO> result = cartService.getAllCarts();

        assertEquals(2, result.size());
        assertEquals(3L, result.get(1).getRestaurantId());
    }

    // ================= TOTAL =================

    @Test
    void cartTotal_success() {
        cart.setTotalPrice(200.0);

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(any())).thenReturn(null);
        when(cartRepository.findByCustomerIdAndIsActiveTrue(any()))
                .thenReturn(Optional.of(cart));

        Double total = cartService.cartTotal(1L);

        assertEquals(200.0, total);
    }
}
