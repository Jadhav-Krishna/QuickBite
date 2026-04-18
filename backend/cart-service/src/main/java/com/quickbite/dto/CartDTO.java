package com.quickbite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDTO {
    private Long id;
    private Long customerId;
    private Long restaurantId;
    private List<CartItemDTO> items;
    private Double totalPrice;
    private Integer totalItems;
    private Boolean isActive;
}
