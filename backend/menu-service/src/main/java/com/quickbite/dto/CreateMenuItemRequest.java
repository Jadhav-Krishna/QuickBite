package com.quickbite.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMenuItemRequest {
    @NotNull(message = "Restaurant ID is required")
    private Long restaurantId;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Price is required")
    private Double price;
    
    private Double discountedPrice;
    
    @NotNull(message = "Preparation time is required")
    private Integer preparationTime;
    
    @NotNull(message = "Vegetarian flag is required")
    private Boolean isVegetarian;
    
    @NotNull(message = "Spicy flag is required")
    private Boolean isSpicy;
    
    private String imageUrl;
}
