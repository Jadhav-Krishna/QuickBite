package com.quickbite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromoCodeDTO {
    private Long id;
    private String code;
    private String description;
    private String discountType;
    private Double discountValue;
    private Double minOrderAmount;
    private Double maxDiscountAmount;
    private Integer usageLimit;
    private Integer usageCount;
    private Boolean isActive;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
