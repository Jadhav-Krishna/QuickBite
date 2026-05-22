package com.quickbite.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shopping_carts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingCart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private Long restaurantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promo_code_id")
    private PromoCode promoCodeEntity;

    @Column(name = "promo_code", length = 50)
    private String promoCode;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();

    @Column(nullable = false)
    private Double subtotal = 0.0;

    @Column(name = "discount_amount", nullable = false)
    private Double discountAmount = 0.0;

    @Column(nullable = false)
    private Double totalPrice = 0.0;

    @Column(nullable = false)
    private Integer totalItems = 0;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addItem(CartItem item) {
        if (item.getCart() == null) {
            item.setCart(this);
        }
        items.add(item);
        updateTotals();
    }

    public void removeItem(CartItem item) {
        items.remove(item);
        item.setCart(null);
        updateTotals();
    }

    public void updateTotals() {
        totalItems = items.stream().mapToInt(CartItem::getQuantity).sum();
        subtotal = items.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();
        
        // Apply discount if promo code exists
        if (promoCodeEntity != null && promoCode != null) {
            discountAmount = promoCodeEntity.calculateDiscount(subtotal);
        } else {
            discountAmount = 0.0;
        }
        
        totalPrice = subtotal - discountAmount;
        if (totalPrice < 0) {
            totalPrice = 0.0;
        }
    }

    public void clear() {
        items.clear();
        totalItems = 0;
        subtotal = 0.0;
        discountAmount = 0.0;
        totalPrice = 0.0;
        promoCode = null;
        promoCodeEntity = null;
    }
}
