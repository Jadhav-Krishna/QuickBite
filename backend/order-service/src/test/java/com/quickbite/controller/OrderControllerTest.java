package com.quickbite.controller;

import com.quickbite.dto.CreateOrderRequest;
import com.quickbite.dto.OrderDTO;
import com.quickbite.entity.OrderStatus;
import com.quickbite.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderController orderController;

    private OrderDTO order;

    @BeforeEach
    void setUp() {
        order = OrderDTO.builder()
                .id(1L)
                .orderNumber("ORD-1")
                .customerId(10L)
                .restaurantId(20L)
                .status(OrderStatus.PLACED)
                .build();
    }

    @Test
    void placeOrderReturnsCreatedOrder() {
        CreateOrderRequest request = CreateOrderRequest.builder().customerId(10L).restaurantId(20L).build();
        when(orderService.placeOrder(request)).thenReturn(order);

        ResponseEntity<OrderDTO> response = orderController.placeOrder(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertSame(order, response.getBody());
    }

    @Test
    void getOrderReturnsOrder() {
        when(orderService.getOrder("ORD-1")).thenReturn(order);

        ResponseEntity<OrderDTO> response = orderController.getOrder("ORD-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(order, response.getBody());
    }

    @Test
    void getCustomerOrdersReturnsOrders() {
        when(orderService.getCustomerOrders(10L)).thenReturn(List.of(order));

        ResponseEntity<List<OrderDTO>> response = orderController.getCustomerOrders(10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(List.of(order), response.getBody());
    }

    @Test
    void getRestaurantActiveOrdersReturnsOrders() {
        when(orderService.getRestaurantActiveOrders(20L)).thenReturn(List.of(order));

        ResponseEntity<List<OrderDTO>> response = orderController.getRestaurantActiveOrders(20L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(List.of(order), response.getBody());
    }

    @Test
    void getDeliveryAgentOrdersReturnsOrders() {
        when(orderService.getDeliveryAgentOrders(30L)).thenReturn(List.of(order));

        ResponseEntity<List<OrderDTO>> response = orderController.getDeliveryAgentOrders(30L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(List.of(order), response.getBody());
    }

    @Test
    void getAvailableOrdersForDeliveryReturnsOrders() {
        when(orderService.getAvailableOrdersForDelivery()).thenReturn(List.of(order));

        ResponseEntity<List<OrderDTO>> response = orderController.getAvailableOrdersForDelivery();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(List.of(order), response.getBody());
    }

    @Test
    void confirmOrderReturnsUpdatedOrder() {
        when(orderService.confirmOrder("ORD-1")).thenReturn(order);

        ResponseEntity<OrderDTO> response = orderController.confirmOrder("ORD-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(order, response.getBody());
    }

    @Test
    void updateOrderStatusReturnsUpdatedOrder() {
        when(orderService.updateOrderStatus("ORD-1", OrderStatus.CONFIRMED)).thenReturn(order);

        ResponseEntity<OrderDTO> response = orderController.updateOrderStatus("ORD-1", OrderStatus.CONFIRMED);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(order, response.getBody());
    }

    @Test
    void assignDeliveryAgentReturnsUpdatedOrder() {
        when(orderService.assignDeliveryAgent("ORD-1", 30L)).thenReturn(order);

        ResponseEntity<OrderDTO> response = orderController.assignDeliveryAgent("ORD-1", 30L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(order, response.getBody());
    }

    @Test
    void confirmRestaurantPickupReturnsUpdatedOrder() {
        when(orderService.confirmPickupByRestaurant("ORD-1")).thenReturn(order);

        ResponseEntity<OrderDTO> response = orderController.confirmRestaurantPickup("ORD-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(order, response.getBody());
    }

    @Test
    void confirmAgentPickupReturnsUpdatedOrder() {
        when(orderService.confirmPickupByAgent("ORD-1", 30L)).thenReturn(order);

        ResponseEntity<OrderDTO> response = orderController.confirmAgentPickup("ORD-1", 30L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(order, response.getBody());
    }

    @Test
    void cancelOrderUsesProvidedReason() {
        when(orderService.cancelOrder("ORD-1", "Changed mind")).thenReturn(order);

        ResponseEntity<OrderDTO> response = orderController.cancelOrder("ORD-1", "Changed mind");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(order, response.getBody());
    }

    @Test
    void cancelOrderUsesDefaultReasonWhenMissing() {
        when(orderService.cancelOrder("ORD-1", "Cancelled by user")).thenReturn(order);

        ResponseEntity<OrderDTO> response = orderController.cancelOrder("ORD-1", null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(orderService).cancelOrder("ORD-1", "Cancelled by user");
    }
}
