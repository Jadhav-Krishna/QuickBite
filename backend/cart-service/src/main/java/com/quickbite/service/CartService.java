package com.quickbite.service;

import com.quickbite.dto.CartDTO;
import com.quickbite.dto.CartItemDTO;
import com.quickbite.entity.CartItem;
import com.quickbite.entity.ShoppingCart;
import com.quickbite.repository.CartRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String CART_PREFIX = "cart:";
    private static final long CART_TTL = 3600; // 1 hour in seconds

    @Transactional
    public CartDTO getOrCreateCart(Long customerId, Long restaurantId) {
        ShoppingCart cart = cartRepository
                .findByCustomerIdAndRestaurantIdAndIsActiveTrue(customerId, restaurantId)
                .orElseGet(() -> createNewCart(customerId, restaurantId));
        
        cacheCart(cart);
        return convertToDTO(cart);
    }

    private ShoppingCart createNewCart(Long customerId, Long restaurantId) {
        ShoppingCart cart = new ShoppingCart();
        cart.setCustomerId(customerId);
        cart.setRestaurantId(restaurantId);
        cart.setIsActive(true);
        return cartRepository.save(cart);
    }

    @Transactional
    public CartDTO addItemToCart(Long customerId, Long restaurantId, CartItemDTO itemDTO) {
        ShoppingCart cart = cartRepository
                .findByCustomerIdAndRestaurantIdAndIsActiveTrue(customerId, restaurantId)
                .orElseGet(() -> createNewCart(customerId, restaurantId));

        // Check if item already exists in cart
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getMenuItemId().equals(itemDTO.getMenuItemId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            // Update quantity if item already exists
            existingItem.setQuantity(existingItem.getQuantity() + itemDTO.getQuantity());
            existingItem.setUpdatedAt(java.time.LocalDateTime.now());
            cart.updateTotals();
        } else {
            // Add new item if it doesn't exist
            CartItem cartItem = new CartItem();
            cartItem.setMenuItemId(itemDTO.getMenuItemId());
            cartItem.setItemName(itemDTO.getItemName());
            cartItem.setQuantity(itemDTO.getQuantity());
            cartItem.setPrice(itemDTO.getPrice());
            cartItem.setSpecialInstructions(itemDTO.getSpecialInstructions());
            cart.addItem(cartItem);
        }

        cart = cartRepository.save(cart);
        
        cacheCart(cart);
        return convertToDTO(cart);
    }

    @Transactional
    public CartDTO updateCartItem(Long customerId, Long restaurantId, Long itemId, Integer quantity) {
        ShoppingCart cart = cartRepository
                .findByCustomerIdAndRestaurantIdAndIsActiveTrue(customerId, restaurantId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        if (quantity <= 0) {
            cart.removeItem(item);
        } else {
            item.setQuantity(quantity);
            item.setUpdatedAt(java.time.LocalDateTime.now());
            cart.updateTotals();
        }

        cart = cartRepository.save(cart);
        cacheCart(cart);
        return convertToDTO(cart);
    }

    @Transactional
    public CartDTO removeItemFromCart(Long customerId, Long restaurantId, Long itemId) {
        ShoppingCart cart = cartRepository
                .findByCustomerIdAndRestaurantIdAndIsActiveTrue(customerId, restaurantId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        cart.removeItem(item);
        cart = cartRepository.save(cart);
        
        cacheCart(cart);
        return convertToDTO(cart);
    }

    @Transactional
    public CartDTO clearCart(Long customerId) {
        ShoppingCart cart = cartRepository.findByCustomerIdAndIsActiveTrue(customerId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.clear();
        cart = cartRepository.save(cart);
        
        removeCacheCart(customerId);
        return convertToDTO(cart);
    }

    @Transactional
    public CartDTO switchRestaurant(Long customerId, Long newRestaurantId) {
        // Deactivate current cart
        cartRepository.findByCustomerIdAndIsActiveTrue(customerId).ifPresent(cart -> {
            cart.setIsActive(false);
            cartRepository.save(cart);
        });

        // Get or create new cart for new restaurant
        ShoppingCart newCart = createNewCart(customerId, newRestaurantId);
        cacheCart(newCart);
        return convertToDTO(newCart);
    }

    @Transactional(readOnly = true)
    public CartDTO getCart(Long customerId) {
        // Try to get from cache first
        CartDTO cachedCart = getCachedCart(customerId);
        if (cachedCart != null) {
            return cachedCart;
        }

        // Get from database or return empty cart
        ShoppingCart cart = cartRepository.findByCustomerIdAndIsActiveTrue(customerId)
                .orElse(null);

        if (cart == null) {
            // Return empty cart DTO instead of throwing exception
            return CartDTO.builder()
                    .customerId(customerId)
                    .items(List.of())
                    .totalPrice(0.0)
                    .totalItems(0)
                    .isActive(false)
                    .build();
        }

        cacheCart(cart);
        return convertToDTO(cart);
    }

    @Transactional
    public void deleteCart(Long customerId) {
        cartRepository.findByCustomerId(customerId).ifPresent(cart -> {
            cart.setIsActive(false);
            cartRepository.save(cart);
        });
        removeCacheCart(customerId);
    }

    @Transactional
    public CartDTO applyPromoCode(Long customerId, String promoCode) {
        ShoppingCart cart = cartRepository.findByCustomerIdAndIsActiveTrue(customerId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        // Placeholder for real promo code validation service call
        if ("DISCOUNT10".equals(promoCode)) {
            // Apply 10% discount
            Double currentTotal = cart.getTotalPrice();
            cart.setTotalPrice(currentTotal * 0.9);
        } else {
            throw new RuntimeException("Invalid promo code");
        }

        cart = cartRepository.save(cart);
        cacheCart(cart);
        return convertToDTO(cart);
    }

    @Transactional(readOnly = true)
    public List<CartDTO> getAllCarts() {
        return cartRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Double cartTotal(Long customerId) {
        CartDTO cart = getCart(customerId);
        return cart.getTotalPrice();
    }

    private CartDTO convertToDTO(ShoppingCart cart) {
        List<CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(item -> CartItemDTO.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItemId())
                        .itemName(item.getItemName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .specialInstructions(item.getSpecialInstructions())
                        .build())
                .collect(Collectors.toList());

        return CartDTO.builder()
                .id(cart.getId())
                .customerId(cart.getCustomerId())
                .restaurantId(cart.getRestaurantId())
                .items(itemDTOs)
                .totalPrice(cart.getTotalPrice())
                .totalItems(cart.getTotalItems())
                .isActive(cart.getIsActive())
                .build();
    }

    private void cacheCart(ShoppingCart cart) {
        try {
            String key = CART_PREFIX + cart.getCustomerId();
            redisTemplate.opsForValue().set(key, convertToDTO(cart), java.time.Duration.ofSeconds(CART_TTL));
            log.debug("Cart cached for customer: {}", cart.getCustomerId());
        } catch (Exception e) {
            log.error("Error caching cart: {}", e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private CartDTO getCachedCart(Long customerId) {
        try {
            String key = CART_PREFIX + customerId;
            Object cachedCart = redisTemplate.opsForValue().get(key);
            if (cachedCart instanceof CartDTO) {
                log.debug("Cart retrieved from cache for customer: {}", customerId);
                return (CartDTO) cachedCart;
            }
        } catch (Exception e) {
            log.error("Error retrieving cached cart: {}", e.getMessage());
        }
        return null;
    }

    private void removeCacheCart(Long customerId) {
        try {
            String key = CART_PREFIX + customerId;
            redisTemplate.delete(key);
            log.debug("Cart cache removed for customer: {}", customerId);
        } catch (Exception e) {
            log.error("Error removing cached cart: {}", e.getMessage());
        }
    }
}
