package com.quickbite.service;

import com.quickbite.dto.CartDTO;
import com.quickbite.dto.CartItemDTO;
import com.quickbite.dto.PromoCodeDTO;
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

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private PromoCodeService promoCodeService;

    private static final String CART_PREFIX = "cart:";
    private static final long CART_TTL = 3600; // 1 hour in seconds

    @Transactional
    public CartDTO getOrCreateCart(Long customerId, Long restaurantId) {
        ShoppingCart cart = getOrCreateUniqueCart(customerId, restaurantId);
        
        try {
            cacheCart(cart);
        } catch (Exception e) {
            log.warn("Failed to cache cart, continuing without cache: {}", e.getMessage());
        }
        return convertToDTO(cart);
    }

    private ShoppingCart getOrCreateUniqueCart(Long customerId, Long restaurantId) {
        List<ShoppingCart> activeCarts = cartRepository.findAllByCustomerIdAndRestaurantIdAndIsActiveTrue(customerId, restaurantId);
        if (activeCarts.isEmpty()) {
            return createNewCart(customerId, restaurantId);
        }
        // Keep the most recent one, deactivate the rest
        ShoppingCart keep = activeCarts.stream()
                .max(java.util.Comparator.comparing(ShoppingCart::getCreatedAt))
                .get();
        activeCarts.stream()
                .filter(c -> !c.getId().equals(keep.getId()))
                .forEach(c -> {
                    c.setIsActive(false);
                    cartRepository.save(c);
                });
        log.info("Resolved {} duplicate active carts for customer: {}, restaurant: {}, keeping cart id: {}",
                activeCarts.size(), customerId, restaurantId, keep.getId());
        return keep;
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
        log.info("addItemToCart called - customerId: {}, restaurantId: {}, itemDTO: {}", 
                customerId, restaurantId, itemDTO);
        
        try {
            ShoppingCart cart = getOrCreateUniqueCart(customerId, restaurantId);

            log.info("Cart found/created with id: {}, items count: {}", cart.getId(), cart.getItems().size());

            // Check if item already exists in cart
            CartItem existingItem = cart.getItems().stream()
                    .filter(item -> item.getMenuItemId().equals(itemDTO.getMenuItemId()))
                    .findFirst()
                    .orElse(null);

            if (existingItem != null) {
                log.info("Item already exists in cart, updating quantity from {} to {}", 
                        existingItem.getQuantity(), existingItem.getQuantity() + itemDTO.getQuantity());
                // Update quantity if item already exists
                existingItem.setQuantity(existingItem.getQuantity() + itemDTO.getQuantity());
                existingItem.setUpdatedAt(java.time.LocalDateTime.now());
                cart.updateTotals();
            } else {
                log.info("Adding new item to cart: {}", itemDTO.getItemName());
                // Add new item if it doesn't exist
                CartItem cartItem = new CartItem();
                cartItem.setMenuItemId(itemDTO.getMenuItemId());
                cartItem.setItemName(itemDTO.getItemName());
                cartItem.setQuantity(itemDTO.getQuantity());
                cartItem.setPrice(itemDTO.getPrice());
                cartItem.setSpecialInstructions(itemDTO.getSpecialInstructions());
                cartItem.setCart(cart);
                cart.addItem(cartItem);
            }

            log.info("Saving cart to database...");
            cart = cartRepository.save(cart);
            log.info("Cart saved successfully with id: {}, total items: {}, total price: {}", 
                    cart.getId(), cart.getTotalItems(), cart.getTotalPrice());
            
            try {
                cacheCart(cart);
            } catch (Exception e) {
                log.warn("Failed to cache cart, continuing without cache: {}", e.getMessage());
            }
            
            CartDTO result = convertToDTO(cart);
            log.info("Returning cart DTO: {}", result);
            return result;
        } catch (Exception e) {
            log.error("Error in addItemToCart: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public CartDTO updateCartItem(Long customerId, Long restaurantId, Long itemId, Integer quantity) {
        ShoppingCart cart = cartRepository
                .findFirstByCustomerIdAndRestaurantIdAndIsActiveTrue(customerId, restaurantId)
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
        try {
            cacheCart(cart);
        } catch (Exception e) {
            log.warn("Failed to cache cart, continuing without cache: {}", e.getMessage());
        }
        return convertToDTO(cart);
    }

    @Transactional
    public CartDTO removeItemFromCart(Long customerId, Long restaurantId, Long itemId) {
        ShoppingCart cart = cartRepository
                .findFirstByCustomerIdAndRestaurantIdAndIsActiveTrue(customerId, restaurantId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        cart.removeItem(item);
        cart = cartRepository.save(cart);
        
        try {
            cacheCart(cart);
        } catch (Exception e) {
            log.warn("Failed to cache cart, continuing without cache: {}", e.getMessage());
        }
        return convertToDTO(cart);
    }

    @Transactional
    public CartDTO clearCart(Long customerId) {
        ShoppingCart cart = cartRepository.findFirstByCustomerIdAndIsActiveTrue(customerId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.clear();
        cart = cartRepository.save(cart);
        
        removeCacheCart(customerId);
        return convertToDTO(cart);
    }

    @Transactional
    public CartDTO switchRestaurant(Long customerId, Long newRestaurantId) {
        // Deactivate all current active carts
        cartRepository.findAllByCustomerIdAndIsActiveTrue(customerId).forEach(cart -> {
            cart.setIsActive(false);
            cartRepository.save(cart);
        });

        // Get or create new cart for new restaurant
        ShoppingCart newCart = createNewCart(customerId, newRestaurantId);
        try {
            cacheCart(newCart);
        } catch (Exception e) {
            log.warn("Failed to cache cart, continuing without cache: {}", e.getMessage());
        }
        return convertToDTO(newCart);
    }

    @Transactional(readOnly = true)
    public CartDTO getCart(Long customerId) {
        // Try to get from cache first
        try {
            CartDTO cachedCart = getCachedCart(customerId);
            if (cachedCart != null) {
                return cachedCart;
            }
        } catch (Exception e) {
            log.warn("Failed to get cached cart, fetching from database: {}", e.getMessage());
        }

        // Get from database or return empty cart
        ShoppingCart cart = cartRepository.findFirstByCustomerIdAndIsActiveTrue(customerId)
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

        try {
            cacheCart(cart);
        } catch (Exception e) {
            log.warn("Failed to cache cart, continuing without cache: {}", e.getMessage());
        }
        return convertToDTO(cart);
    }

    @Transactional
    public void deleteCart(Long customerId) {
        cartRepository.findFirstByCustomerId(customerId).ifPresent(cart -> {
            cart.setIsActive(false);
            cartRepository.save(cart);
        });
        try {
            removeCacheCart(customerId);
        } catch (Exception e) {
            log.warn("Failed to remove cached cart: {}", e.getMessage());
        }
    }

    @Transactional
    public CartDTO applyPromoCode(Long customerId, String promoCode) {
        log.info("Applying promo code: {} for customer: {}", promoCode, customerId);
        
        ShoppingCart cart = cartRepository.findFirstByCustomerIdAndIsActiveTrue(customerId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        com.quickbite.entity.PromoCode validPromoCode = promoCodeService.validatePromoCode(promoCode, cart.getSubtotal());

        cart.setPromoCodeEntity(validPromoCode);
        cart.setPromoCode(validPromoCode.getCode());
        cart.updateTotals();

        cart = cartRepository.save(cart);
        log.info("Promo code applied successfully: {} - Discount: {}", promoCode, cart.getDiscountAmount());
        
        try {
            cacheCart(cart);
        } catch (Exception e) {
            log.warn("Failed to cache cart, continuing without cache: {}", e.getMessage());
        }
        return convertToDTO(cart);
    }

    @Transactional
    public CartDTO removePromoCode(Long customerId) {
        log.info("Removing promo code for customer: {}", customerId);
        
        ShoppingCart cart = cartRepository.findFirstByCustomerIdAndIsActiveTrue(customerId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.setPromoCodeEntity(null);
        cart.setPromoCode(null);
        cart.updateTotals();

        cart = cartRepository.save(cart);
        log.info("Promo code removed successfully");
        
        try {
            cacheCart(cart);
        } catch (Exception e) {
            log.warn("Failed to cache cart, continuing without cache: {}", e.getMessage());
        }
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

        PromoCodeDTO promoCodeDTO = null;
        if (cart.getPromoCodeEntity() != null) {
            com.quickbite.entity.PromoCode pc = cart.getPromoCodeEntity();
            promoCodeDTO = PromoCodeDTO.builder()
                    .id(pc.getId())
                    .code(pc.getCode())
                    .description(pc.getDescription())
                    .discountType(pc.getDiscountType().name())
                    .discountValue(pc.getDiscountValue())
                    .build();
        }

        return CartDTO.builder()
                .id(cart.getId())
                .customerId(cart.getCustomerId())
                .restaurantId(cart.getRestaurantId())
                .items(itemDTOs)
                .subtotal(cart.getSubtotal())
                .discountAmount(cart.getDiscountAmount())
                .totalPrice(cart.getTotalPrice())
                .totalItems(cart.getTotalItems())
                .isActive(cart.getIsActive())
                .promoCode(cart.getPromoCode())
                .appliedPromoCode(promoCodeDTO)
                .build();
    }

    private void cacheCart(ShoppingCart cart) {
        if (redisTemplate == null) {
            log.debug("Redis not available, skipping cache");
            return;
        }
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
        if (redisTemplate == null) {
            return null;
        }
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
        if (redisTemplate == null) {
            return;
        }
        try {
            String key = CART_PREFIX + customerId;
            redisTemplate.delete(key);
            log.debug("Cart cache removed for customer: {}", customerId);
        } catch (Exception e) {
            log.error("Error removing cached cart: {}", e.getMessage());
        }
    }
}
