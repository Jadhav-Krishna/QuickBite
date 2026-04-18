package com.quickbite.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Point;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "restaurants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long ownerId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String cuisineType;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String pincode;

    @Column(name = "location", columnDefinition = "POINT")
    private Point location;

    @Column(nullable = false)
    private Double rating = 0.0;

    @Column(nullable = false)
    private Integer reviewCount = 0;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private Double deliveryFee = 0.0;

    @Column(nullable = false)
    private Double deliveryRadius = 10.0; // in km — PDF requirement

    @Column(nullable = false)
    private Double minOrderAmount = 0.0; // PDF requirement

    @Column(nullable = false)
    private Integer minDeliveryTime = 30;

    @Column(nullable = false)
    private Integer maxDeliveryTime = 60;

    @Column(nullable = false)
    private Integer estimatedDeliveryMin = 45; // PDF requirement

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private Boolean isOpen = false; // PDF: open-toggle

    @Column(nullable = false)
    private Boolean isApproved = false; // PDF: admin approval

    @Column(nullable = false)
    private String imageUrl;

    @Column(name = "opening_time")
    private String openingTime;

    @Column(name = "closing_time")
    private String closingTime;

    @ElementCollection
    @CollectionTable(name = "restaurant_cuisines")
    private Set<String> cuisines = new HashSet<>();

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
}
