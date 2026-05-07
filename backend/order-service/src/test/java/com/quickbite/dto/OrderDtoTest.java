package com.quickbite.dto;

import com.quickbite.entity.OrderStatus;
import com.quickbite.entity.PaymentMethod;
import com.quickbite.entity.PaymentStatus;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OrderDtoTest {

    @Test
    void orderItemDtoCalculatesTotalAndSupportsDataMethods() {
        OrderItemDTO item = OrderItemDTO.builder()
                .id(1L)
                .menuItemId(2L)
                .itemName("Pizza")
                .quantity(3)
                .price(75.0)
                .specialInstructions("Extra cheese")
                .build();

        assertEquals(225.0, item.getItemTotal());
        assertTrue(item.toString().contains("Pizza"));
        assertEquals(item, new OrderItemDTO(1L, 2L, "Pizza", 3, 75.0, "Extra cheese"));
    }

    @Test
    void orderDtoBuilderAndDataMethodsWork() {
        LocalDateTime now = LocalDateTime.now();
        OrderDTO order = OrderDTO.builder()
                .id(1L)
                .orderNumber("ORD-1")
                .customerId(2L)
                .restaurantId(3L)
                .status(OrderStatus.PLACED)
                .totalAmount(100.0)
                .deliveryCharge(10.0)
                .discountAmount(5.0)
                .finalAmount(105.0)
                .deliveryAddress("Main Street")
                .deliveryLatitude(1.1)
                .deliveryLongitude(2.2)
                .customerPhone("9999999999")
                .specialInstructions("Ring bell")
                .deliveryAgentId(4L)
                .restaurantPickupConfirmed(false)
                .restaurantPickupConfirmedAt(now)
                .agentPickupConfirmed(false)
                .agentPickupConfirmedAt(now)
                .estimatedDeliveryTime(now)
                .actualDeliveryTime(now)
                .paymentMethod(PaymentMethod.UPI)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentCompleted(false)
                .items(List.of())
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertEquals("ORD-1", order.getOrderNumber());
        assertTrue(order.toString().contains("ORD-1"));
    }

    @Test
    void createOrderRequestBuilderAndSettersWork() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerId(1L)
                .restaurantId(2L)
                .items(List.of())
                .totalAmount(100.0)
                .deliveryCharge(10.0)
                .discountAmount(5.0)
                .finalAmount(105.0)
                .deliveryAddress("Main Street")
                .deliveryLatitude(1.1)
                .deliveryLongitude(2.2)
                .customerPhone("9999999999")
                .specialInstructions("Ring bell")
                .paymentMethod("UPI")
                .build();

        CreateOrderRequest changed = new CreateOrderRequest();
        changed.setCustomerId(1L);
        changed.setRestaurantId(2L);
        changed.setItems(List.of());
        changed.setTotalAmount(100.0);
        changed.setDeliveryCharge(10.0);
        changed.setDiscountAmount(0.0);
        changed.setFinalAmount(110.0);
        changed.setDeliveryAddress("Main Street");
        changed.setDeliveryLatitude(1.1);
        changed.setDeliveryLongitude(2.2);
        changed.setCustomerPhone("9999999999");
        changed.setSpecialInstructions("Ring bell");
        changed.setPaymentMethod("UPI");

        assertEquals(105.0, request.getFinalAmount());
        assertNotEquals(request, changed);
    }
}
