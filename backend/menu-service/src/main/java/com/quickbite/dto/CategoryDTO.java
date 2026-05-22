package com.quickbite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {
    private Long id;
    private Long restaurantId;
    private String name;
    private String description;
    private Integer displayOrder;
    private Boolean isActive;
    private String imageUrl;
}
