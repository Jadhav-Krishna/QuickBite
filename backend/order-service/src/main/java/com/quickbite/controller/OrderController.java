package com.quickbite.controller;

import com.quickbite.dto.OrderDTO;
import com.quickbite.entity.OrderStatus;
import com.quickbite.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@Slf4j
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDTO> placeOrder(@RequestBody OrderDTO orderDTO) {
        log.info("Placing order for customer: {}", orderDTO.getCustomerId());
        OrderDTO createdOrder = orderService.placeOrder(orderDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable("orderNumber") String orderNumber) {
        OrderDTO order = orderService.getOrder(orderNumber);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderDTO>> getCustomerOrders(@PathVariable("customerId") Long customerId) {
        List<OrderDTO> orders = orderService.getCustomerOrders(customerId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<OrderDTO>> getRestaurantActiveOrders(@PathVariable("restaurantId") Long restaurantId) {
        List<OrderDTO> orders = orderService.getRestaurantActiveOrders(restaurantId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/delivery-agent/{agentId}")
    public ResponseEntity<List<OrderDTO>> getDeliveryAgentOrders(@PathVariable("agentId") Long agentId) {
        List<OrderDTO> orders = orderService.getDeliveryAgentOrders(agentId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/available")
    public ResponseEntity<List<OrderDTO>> getAvailableOrdersForDelivery() {
        List<OrderDTO> orders = orderService.getAvailableOrdersForDelivery();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{orderNumber}/confirm")
    public ResponseEntity<OrderDTO> confirmOrder(@PathVariable("orderNumber") String orderNumber) {
        log.info("Confirming order: {}", orderNumber);
        OrderDTO updatedOrder = orderService.confirmOrder(orderNumber);
        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/{orderNumber}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable("orderNumber") String orderNumber,
            @RequestParam("status") OrderStatus status) {
        log.info("Updating order {} status to {}", orderNumber, status);
        OrderDTO updatedOrder = orderService.updateOrderStatus(orderNumber, status);
        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/{orderNumber}/assign-delivery")
    public ResponseEntity<OrderDTO> assignDeliveryAgent(
            @PathVariable("orderNumber") String orderNumber,
            @RequestParam("deliveryAgentId") Long deliveryAgentId) {
        log.info("Assigning delivery agent {} to order {}", deliveryAgentId, orderNumber);
        OrderDTO updatedOrder = orderService.assignDeliveryAgent(orderNumber, deliveryAgentId);
        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/{orderNumber}/cancel")
    public ResponseEntity<OrderDTO> cancelOrder(
            @PathVariable("orderNumber") String orderNumber,
            @RequestParam(name = "reason", required = false) String reason) {
        log.info("Cancelling order: {}", orderNumber);
        OrderDTO cancelledOrder = orderService.cancelOrder(orderNumber, reason != null ? reason : "Cancelled by user");
        return ResponseEntity.ok(cancelledOrder);
    }
}
