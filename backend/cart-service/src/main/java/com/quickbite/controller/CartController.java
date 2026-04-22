package com.quickbite.controller;

import com.quickbite.dto.CartDTO;
import com.quickbite.dto.CartItemDTO;
import com.quickbite.service.CartService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cart")
@Slf4j
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<CartDTO> getCart(
            @RequestParam Long customerId) {
        CartDTO cart = cartService.getCart(customerId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping
    public ResponseEntity<CartDTO> createCart(
            @RequestParam Long customerId,
            @RequestParam Long restaurantId) {
        CartDTO cart = cartService.getOrCreateCart(customerId, restaurantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<CartDTO> addItemToCart(
            @RequestParam Long customerId,
            @RequestParam Long restaurantId,
            @RequestBody CartItemDTO itemDTO) {
        CartDTO cart = cartService.addItemToCart(customerId, restaurantId, itemDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(cart);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDTO> updateCartItem(
            @RequestParam Long customerId,
            @RequestParam Long restaurantId,
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {
        CartDTO cart = cartService.updateCartItem(customerId, restaurantId, itemId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDTO> removeItemFromCart(
            @RequestParam Long customerId,
            @RequestParam Long restaurantId,
            @PathVariable Long itemId) {
        CartDTO cart = cartService.removeItemFromCart(customerId, restaurantId, itemId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping
    public ResponseEntity<CartDTO> clearCart(
            @RequestParam Long customerId) {
        CartDTO cart = cartService.clearCart(customerId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/switch-restaurant")
    public ResponseEntity<CartDTO> switchRestaurant(
            @RequestParam Long customerId,
            @RequestParam Long newRestaurantId) {
        CartDTO cart = cartService.switchRestaurant(customerId, newRestaurantId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/full")
    public ResponseEntity<Void> deleteCart(
            @RequestParam Long customerId) {
        cartService.deleteCart(customerId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/promo")
    public ResponseEntity<CartDTO> applyPromoCode(
            @RequestParam Long customerId,
            @RequestParam String promoCode) {
        log.info("Apply promo code {} for customer {}", promoCode, customerId);
        CartDTO cart = cartService.applyPromoCode(customerId, promoCode);
        return ResponseEntity.ok(cart);
    }

    @GetMapping("/all")
    public ResponseEntity<List<CartDTO>> getAllCarts() {
        List<CartDTO> carts = cartService.getAllCarts();
        return ResponseEntity.ok(carts);
    }

    @GetMapping("/total")
    public ResponseEntity<Double> getCartTotal(@RequestParam Long customerId) {
        Double total = cartService.cartTotal(customerId);
        return ResponseEntity.ok(total);
    }
}
