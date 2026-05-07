package com.quickbite.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePromoCodeRequest {
    @NotBlank(message = "Promo code is required")
    @Size(min = 3, max = 50, message = "Promo code must be between 3 and 50 characters")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "Promo code must contain only uppercase letters and numbers")
    private String code;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @NotBlank(message = "Discount type is required")
    @Pattern(regexp = "PERCENTAGE|FIXED", message = "Discount type must be PERCENTAGE or FIXED")
    private String discountType;

    @NotNull(message = "Discount value is required")
    @Positive(message = "Discount value must be positive")
    private Double discountValue;

    @PositiveOrZero(message = "Minimum order amount must be zero or positive")
    private Double minOrderAmount = 0.0;

    @Positive(message = "Maximum discount amount must be positive")
    private Double maxDiscountAmount;

    @Positive(message = "Usage limit must be positive")
    private Integer usageLimit;

    @NotNull(message = "Valid from date is required")
    private LocalDateTime validFrom;

    @NotNull(message = "Valid until date is required")
    private LocalDateTime validUntil;
}
