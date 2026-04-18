package com.quickbite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDTO {
    private Long id;
    private Long menuItemId;
    private String itemName;
    private Integer quantity;
    private Double price;
    private String specialInstructions;

    public Double getItemTotal() {
        return price * quantity;
    }
}
