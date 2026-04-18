package com.quickbite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemDTO {
    private Long id;
    private Long restaurantId;
    private Long categoryId;
    private String name;
    private String description;
    private Double price;
    private Double discountedPrice;
    private Boolean isAvailable;
    private Integer preparationTime;
    private Integer orderCount;
    private Double rating;
    private Boolean isVegetarian;
    private Boolean isSpicy;
    private String imageUrl;
}
