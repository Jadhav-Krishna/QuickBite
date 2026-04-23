package com.quickbite.service;

import com.quickbite.dto.OrderDTO;
import com.quickbite.dto.OrderItemDTO;
import com.quickbite.entity.*;
import com.quickbite.event.OrderEvent;
import com.quickbite.repository.OrderRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    private static final String ORDER_EXCHANGE = "order.exchange";
    private static final String ORDER_QUEUE = "order.queue";
    private static final String ORDER_ROUTING_KEY = "order.#";

    @Transactional
    public OrderDTO placeOrder(OrderDTO orderDTO) {
        log.info("Placing order for customer: {}, restaurant: {}", orderDTO.getCustomerId(), orderDTO.getRestaurantId());

        // Create order with PENDING status
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setCustomerId(orderDTO.getCustomerId());
        order.setRestaurantId(orderDTO.getRestaurantId());
        order.setStatus(OrderStatus.PLACED);
        order.setTotalAmount(orderDTO.getTotalAmount());
        order.setDeliveryCharge(orderDTO.getDeliveryCharge() != null ? orderDTO.getDeliveryCharge() : 0.0);
        order.setDiscountAmount(orderDTO.getDiscountAmount() != null ? orderDTO.getDiscountAmount() : 0.0);
        order.setFinalAmount(calculateFinalAmount(orderDTO));
        order.setDeliveryAddress(orderDTO.getDeliveryAddress());
        order.setCustomerPhone(orderDTO.getCustomerPhone());
        order.setSpecialInstructions(orderDTO.getSpecialInstructions());
        order.setRestaurantPickupConfirmed(false);
        order.setAgentPickupConfirmed(false);
        order.setEstimatedDeliveryTime(LocalDateTime.now().plusMinutes(45));
        order.setPaymentMethod(orderDTO.getPaymentMethod());
        order.setPaymentStatus(PaymentStatus.PENDING);

        // Add order items
        if (orderDTO.getItems() != null && !orderDTO.getItems().isEmpty()) {
            for (OrderItemDTO itemDTO : orderDTO.getItems()) {
                OrderItem item = new OrderItem();
                item.setMenuItemId(itemDTO.getMenuItemId());
                item.setItemName(itemDTO.getItemName());
                item.setQuantity(itemDTO.getQuantity());
                item.setPrice(itemDTO.getPrice());
                item.setSpecialInstructions(itemDTO.getSpecialInstructions());
                order.addItem(item);
            }
        }

        // Save order
        order = orderRepository.save(order);
        log.info("Order placed successfully: {}", order.getOrderNumber());

        // Publish ORDER_PLACED event
        publishOrderEvent(OrderEvent.EventType.ORDER_PLACED.name(), order, "Order placed successfully");

        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO confirmOrder(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

        if (!order.getStatus().equals(OrderStatus.PLACED)) {
            throw new RuntimeException("Order cannot be confirmed. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CONFIRMED);
        order.setPaymentStatus(PaymentStatus.SUCCESS);
        order.setPaymentCompleted(true);
        order = orderRepository.save(order);

        // Publish ORDER_CONFIRMED event
        publishOrderEvent(OrderEvent.EventType.ORDER_CONFIRMED.name(), order, "Order confirmed. Restaurant has been notified.");

        log.info("Order confirmed: {}", orderNumber);
        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(String orderNumber, OrderStatus newStatus) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

        OrderStatus currentStatus = order.getStatus();
        log.info("Updating order {} status from {} to {}", orderNumber, currentStatus, newStatus);

        // Validate status transition
        if (!isValidStatusTransition(currentStatus, newStatus)) {
            throw new RuntimeException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        order.setStatus(newStatus);

        if (newStatus.equals(OrderStatus.PICKED_UP)) {
            if (!Boolean.TRUE.equals(order.getRestaurantPickupConfirmed()) || !Boolean.TRUE.equals(order.getAgentPickupConfirmed())) {
                throw new RuntimeException("Pickup requires confirmation from both restaurant and delivery agent");
            }
            order.setActualDeliveryTime(null);
        }

        if (newStatus.equals(OrderStatus.READY)) {
            order.setRestaurantPickupConfirmed(false);
            order.setRestaurantPickupConfirmedAt(null);
            order.setAgentPickupConfirmed(false);
            order.setAgentPickupConfirmedAt(null);
        }

        // Update actual delivery time if delivered
        if (newStatus.equals(OrderStatus.DELIVERED)) {
            order.setActualDeliveryTime(LocalDateTime.now());
        }

        order = orderRepository.save(order);

        // Publish status change event
        publishOrderEvent(resolveEventTypeForStatus(newStatus), order, "Order status updated to " + newStatus);

        log.info("Order status updated successfully: {}", orderNumber);
        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO assignDeliveryAgent(String orderNumber, Long deliveryAgentId) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

        if (!order.getStatus().equals(OrderStatus.READY)) {
            throw new RuntimeException("Order must be READY before assigning delivery agent");
        }

        if (order.getDeliveryAgentId() != null) {
            throw new RuntimeException("Order already has a delivery agent assigned");
        }

        order.setDeliveryAgentId(deliveryAgentId);
        order.setAgentPickupConfirmed(false);
        order.setAgentPickupConfirmedAt(null);
        order = orderRepository.save(order);
        publishOrderEvent("DELIVERY_AGENT_ASSIGNED", order, "Delivery agent assigned to order");

        log.info("Delivery agent {} assigned to order {}", deliveryAgentId, orderNumber);
        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO cancelOrder(String orderNumber, String reason) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

        // Can only cancel if not already delivered or cancelled
        if (order.getStatus().equals(OrderStatus.DELIVERED) || order.getStatus().equals(OrderStatus.CANCELLED)) {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        // Publish cancellation event
        publishOrderEvent("ORDER_CANCELLED", order, reason);

        log.info("Order cancelled: {}", orderNumber);
        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO confirmPickupByRestaurant(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

        if (!(order.getStatus().equals(OrderStatus.READY) || order.getStatus().equals(OrderStatus.PICKED_UP))) {
            throw new RuntimeException("Order must be READY before pickup confirmation");
        }

        if (order.getDeliveryAgentId() == null) {
            throw new RuntimeException("Delivery agent is not assigned yet");
        }

        if (!Boolean.TRUE.equals(order.getRestaurantPickupConfirmed())) {
            order.setRestaurantPickupConfirmed(true);
            order.setRestaurantPickupConfirmedAt(LocalDateTime.now());
            order = maybePromoteToPickedUp(order);
            order = orderRepository.save(order);
        }

        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO confirmPickupByAgent(String orderNumber, Long deliveryAgentId) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

        if (!(order.getStatus().equals(OrderStatus.READY) || order.getStatus().equals(OrderStatus.PICKED_UP))) {
            throw new RuntimeException("Order must be READY before pickup confirmation");
        }

        if (order.getDeliveryAgentId() == null) {
            throw new RuntimeException("Delivery agent is not assigned yet");
        }

        if (!order.getDeliveryAgentId().equals(deliveryAgentId)) {
            throw new RuntimeException("Only assigned delivery agent can confirm pickup");
        }

        if (!Boolean.TRUE.equals(order.getAgentPickupConfirmed())) {
            order.setAgentPickupConfirmed(true);
            order.setAgentPickupConfirmedAt(LocalDateTime.now());
            order = maybePromoteToPickedUp(order);
            order = orderRepository.save(order);
        }

        return convertToDTO(order);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrder(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));
        return convertToDTO(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getCustomerOrders(Long customerId) {
        return orderRepository.findCustomerOrderHistory(customerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getRestaurantActiveOrders(Long restaurantId) {
        return orderRepository.findActiveOrdersByRestaurant(restaurantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getDeliveryAgentOrders(Long agentId) {
        return orderRepository.findActiveOrdersByDeliveryAgent(agentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getAvailableOrdersForDelivery() {
        return orderRepository.findByStatusAndDeliveryAgentIdIsNullOrderByCreatedAtAsc(OrderStatus.READY).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDTO reorderFromHistory(String orderNumber) {
        Order oldOrder = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

        OrderDTO newOrderDTO = convertToDTO(oldOrder);
        newOrderDTO.setId(null);
        newOrderDTO.setOrderNumber(null);
        return placeOrder(newOrderDTO);
    }

    @Transactional(readOnly = true)
    public long getOrderCount() {
        return orderRepository.count();
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getActiveOrders() {
        return orderRepository.findByStatus(OrderStatus.PLACED).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private OrderDTO convertToDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(item -> OrderItemDTO.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItemId())
                        .itemName(item.getItemName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .specialInstructions(item.getSpecialInstructions())
                        .build())
                .collect(Collectors.toList());

        return OrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomerId())
                .restaurantId(order.getRestaurantId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .deliveryCharge(order.getDeliveryCharge())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .deliveryAddress(order.getDeliveryAddress())
                .customerPhone(order.getCustomerPhone())
                .specialInstructions(order.getSpecialInstructions())
                .deliveryAgentId(order.getDeliveryAgentId())
                .restaurantPickupConfirmed(order.getRestaurantPickupConfirmed())
                .restaurantPickupConfirmedAt(order.getRestaurantPickupConfirmedAt())
                .agentPickupConfirmed(order.getAgentPickupConfirmed())
                .agentPickupConfirmedAt(order.getAgentPickupConfirmedAt())
                .estimatedDeliveryTime(order.getEstimatedDeliveryTime())
                .actualDeliveryTime(order.getActualDeliveryTime())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .paymentCompleted(order.getPaymentCompleted())
                .items(itemDTOs)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private void publishOrderEvent(String eventType, Order order, String message) {
        try {
            OrderEvent event = OrderEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .eventType(eventType)
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .customerId(order.getCustomerId())
                    .restaurantId(order.getRestaurantId())
                    .orderStatus(order.getStatus().name())
                    .totalAmount(order.getFinalAmount())
                    .paymentMethod(order.getPaymentMethod().name())
                    .timestamp(LocalDateTime.now())
                    .message(message)
                    .build();

            rabbitTemplate.convertAndSend(ORDER_EXCHANGE, ORDER_ROUTING_KEY, event);
            log.info("Order event published: {} - {}", eventType, order.getOrderNumber());
        } catch (Exception e) {
            log.error("Error publishing order event: {}", e.getMessage());
        }
    }

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis();
    }

    private Double calculateFinalAmount(OrderDTO orderDTO) {
        Double total = orderDTO.getTotalAmount();
        if (orderDTO.getDeliveryCharge() != null) {
            total += orderDTO.getDeliveryCharge();
        }
        if (orderDTO.getDiscountAmount() != null) {
            total -= orderDTO.getDiscountAmount();
        }
        return Math.max(total, 0.0);
    }

    private boolean isValidStatusTransition(OrderStatus from, OrderStatus to) {
        return switch (from) {
            case PLACED -> to.equals(OrderStatus.CONFIRMED) || to.equals(OrderStatus.CANCELLED);
            case CONFIRMED -> to.equals(OrderStatus.PREPARING) || to.equals(OrderStatus.CANCELLED);
            case PREPARING -> to.equals(OrderStatus.READY) || to.equals(OrderStatus.CANCELLED);
            case READY -> to.equals(OrderStatus.PICKED_UP) || to.equals(OrderStatus.CANCELLED);
            case PICKED_UP -> to.equals(OrderStatus.IN_TRANSIT) || to.equals(OrderStatus.CANCELLED);
            case IN_TRANSIT -> to.equals(OrderStatus.DELIVERED) || to.equals(OrderStatus.CANCELLED);
            case DELIVERED, CANCELLED, FAILED -> false;
        };
    }

    private Order maybePromoteToPickedUp(Order order) {
        if (
                order.getStatus().equals(OrderStatus.READY)
                        && Boolean.TRUE.equals(order.getRestaurantPickupConfirmed())
                        && Boolean.TRUE.equals(order.getAgentPickupConfirmed())
        ) {
            order.setStatus(OrderStatus.PICKED_UP);
            order.setActualDeliveryTime(null);
            publishOrderEvent(
                    OrderEvent.EventType.ORDER_PICKED_UP.name(),
                    order,
                    "Pickup confirmed by restaurant and delivery agent"
            );
        }
        return order;
    }

    private String resolveEventTypeForStatus(OrderStatus status) {
        return switch (status) {
            case PLACED -> OrderEvent.EventType.ORDER_PLACED.name();
            case CONFIRMED -> OrderEvent.EventType.ORDER_CONFIRMED.name();
            case PREPARING -> OrderEvent.EventType.ORDER_PREPARING.name();
            case READY -> OrderEvent.EventType.ORDER_READY.name();
            case PICKED_UP -> OrderEvent.EventType.ORDER_PICKED_UP.name();
            case IN_TRANSIT -> OrderEvent.EventType.ORDER_IN_TRANSIT.name();
            case DELIVERED -> OrderEvent.EventType.ORDER_DELIVERED.name();
            case CANCELLED -> OrderEvent.EventType.ORDER_CANCELLED.name();
            case FAILED -> "ORDER_FAILED";
        };
    }
}
