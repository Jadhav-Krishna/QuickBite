package com.quickbite.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_agents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryAgent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column(nullable = false)
    private String vehicleType; // BIKE, SCOOTER, CAR

    @Column(nullable = false)
    private String vehicleNumber;

    @Column(nullable = false)
    private String licenseNumber;

    @Column
    private Double currentLatitude;

    @Column
    private Double currentLongitude;

    @Column
    private String lastKnownAddress;

    @Column
    private LocalDateTime lastLocationUpdateTime;

    @Column
    private LocalDateTime lastStatusUpdateTime;

    @Column
    private Double averageRating = 0.0;

    @Column
    private Long totalDeliveries = 0L;

    @Column
    private Boolean isActive = true;

    @Column
    private Boolean isVerified = false;

    @Column
    private Boolean isOnline = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

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