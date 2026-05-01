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
    
    private Double totalAmount;
    
    private Double deliveryCharge;
    
    private Double discountAmount;
    
    private Double finalAmount;
    
    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;
    
    private Double deliveryLatitude;
    
    private Double deliveryLongitude;
    
    @NotBlank(message = "Customer phone is required")
    private String customerPhone;
    
    private String specialInstructions;
    
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
}
