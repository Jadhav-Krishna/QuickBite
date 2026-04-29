package com.quickbite.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {
    @NotNull(message = "Customer ID is required")
    private Long customerId;
    
    @NotNull(message = "Restaurant ID is required")
    private Long restaurantId;
    
    @NotNull(message = "Order items are required")
    private List<OrderItemDTO> items;
    
    @NotNull(message = "Total amount is required")
    private Double totalAmount;
    
    private Double deliveryFee;
    
    @NotNull(message = "Estimated delivery time is required")
    private Integer estimatedDeliveryTime;
    
    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;
    
    private String specialInstructions;
    
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
}
