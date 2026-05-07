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
            @RequestParam("customerId") Long customerId) {
        CartDTO cart = cartService.getCart(customerId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping
    public ResponseEntity<CartDTO> createCart(
            @RequestParam("customerId") Long customerId,
            @RequestParam("restaurantId") Long restaurantId) {
        CartDTO cart = cartService.getOrCreateCart(customerId, restaurantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<CartDTO> addItemToCart(
            @RequestParam("customerId") Long customerId,
            @RequestParam("restaurantId") Long restaurantId,
            @RequestBody CartItemDTO itemDTO) {
        try {
            log.info("Adding item to cart - customerId: {}, restaurantId: {}, item: {}", 
                    customerId, restaurantId, itemDTO);
            CartDTO cart = cartService.addItemToCart(customerId, restaurantId, itemDTO);
            log.info("Item added successfully to cart: {}", cart);
            return ResponseEntity.status(HttpStatus.CREATED).body(cart);
        } catch (Exception e) {
            log.error("Error adding item to cart - customerId: {}, restaurantId: {}, error: {}", 
                    customerId, restaurantId, e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDTO> updateCartItem(
            @RequestParam("customerId") Long customerId,
            @RequestParam("restaurantId") Long restaurantId,
            @PathVariable("itemId") Long itemId,
            @RequestParam("quantity") Integer quantity) {
        CartDTO cart = cartService.updateCartItem(customerId, restaurantId, itemId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDTO> removeItemFromCart(
            @RequestParam("customerId") Long customerId,
            @RequestParam("restaurantId") Long restaurantId,
            @PathVariable("itemId") Long itemId) {
        CartDTO cart = cartService.removeItemFromCart(customerId, restaurantId, itemId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping
    public ResponseEntity<CartDTO> clearCart(
            @RequestParam("customerId") Long customerId) {
        CartDTO cart = cartService.clearCart(customerId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/switch-restaurant")
    public ResponseEntity<CartDTO> switchRestaurant(
            @RequestParam("customerId") Long customerId,
            @RequestParam("newRestaurantId") Long newRestaurantId) {
        CartDTO cart = cartService.switchRestaurant(customerId, newRestaurantId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/full")
    public ResponseEntity<Void> deleteCart(
            @RequestParam("customerId") Long customerId) {
        cartService.deleteCart(customerId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/promo")
    public ResponseEntity<CartDTO> applyPromoCode(
            @RequestParam("customerId") Long customerId,
            @RequestParam("promoCode") String promoCode) {
        log.info("Apply promo code {} for customer {}", promoCode, customerId);
        CartDTO cart = cartService.applyPromoCode(customerId, promoCode);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/promo")
    public ResponseEntity<CartDTO> removePromoCode(
            @RequestParam("customerId") Long customerId) {
        log.info("Remove promo code for customer {}", customerId);
        CartDTO cart = cartService.removePromoCode(customerId);
        return ResponseEntity.ok(cart);
    }

    @GetMapping("/all")
    public ResponseEntity<List<CartDTO>> getAllCarts() {
        List<CartDTO> carts = cartService.getAllCarts();
        return ResponseEntity.ok(carts);
    }

    @GetMapping("/total")
    public ResponseEntity<Double> getCartTotal(@RequestParam("customerId") Long customerId) {
        Double total = cartService.cartTotal(customerId);
        return ResponseEntity.ok(total);
    }
}
