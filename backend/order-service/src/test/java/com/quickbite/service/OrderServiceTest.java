package com.quickbite.service;

import com.quickbite.dto.*;
import com.quickbite.entity.*;
import com.quickbite.event.OrderEvent;
import com.quickbite.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private RabbitTemplate rabbitTemplate;

    @InjectMocks private OrderService orderService;

    private Order order;

    @BeforeEach
    void setup() {
        order = new Order();
        order.setId(1L);
        order.setOrderNumber("ORD-1");
        order.setCustomerId(1L);
        order.setRestaurantId(1L);
        order.setStatus(OrderStatus.PLACED);
        order.setFinalAmount(100.0);
        order.setPaymentMethod(PaymentMethod.UPI);
        order.setRestaurantPickupConfirmed(false);
        order.setAgentPickupConfirmed(false);
    }

    // ================= PLACE ORDER =================

    @Test
    void placeOrder_success() {
        CreateOrderRequest req = new CreateOrderRequest();
        req.setCustomerId(1L);
        req.setRestaurantId(1L);
        req.setTotalAmount(100.0);

        when(orderRepository.save(any())).thenReturn(order);

        OrderDTO result = orderService.placeOrder(req);

        assertNotNull(result);
        verify(orderRepository).save(any());
    }

    // ================= CONFIRM =================

    @Test
    void confirmOrder_success() {
        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        OrderDTO result = orderService.confirmOrder("ORD-1");

        assertEquals(OrderStatus.CONFIRMED, order.getStatus());
        assertEquals(PaymentStatus.SUCCESS, order.getPaymentStatus());
    }

    @Test
    void confirmOrder_invalidState() {
        order.setStatus(OrderStatus.DELIVERED);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> orderService.confirmOrder("ORD-1"));
    }

    // ================= STATUS =================

    @Test
    void updateStatus_validTransition() {
        order.setStatus(OrderStatus.PLACED);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        orderService.updateOrderStatus("ORD-1", OrderStatus.CONFIRMED);

        assertEquals(OrderStatus.CONFIRMED, order.getStatus());
    }

    @Test
    void updateStatus_invalidTransition() {
        order.setStatus(OrderStatus.PLACED);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> orderService.updateOrderStatus("ORD-1", OrderStatus.DELIVERED));
    }

    // ================= ASSIGN =================

    @Test
    void assignAgent_success() {
        order.setStatus(OrderStatus.READY);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        orderService.assignDeliveryAgent("ORD-1", 10L);

        assertEquals(10L, order.getDeliveryAgentId());
    }

    @Test
    void assignAgent_invalidState() {
        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> orderService.assignDeliveryAgent("ORD-1", 10L));
    }

    // ================= CANCEL =================

    @Test
    void cancelOrder_success() {
        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        orderService.cancelOrder("ORD-1", "test");

        assertEquals(OrderStatus.CANCELLED, order.getStatus());
    }

    @Test
    void cancelOrder_invalid() {
        order.setStatus(OrderStatus.DELIVERED);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> orderService.cancelOrder("ORD-1", "test"));
    }

    // ================= PICKUP =================

    @Test
    void confirmPickupRestaurant_success() {
        order.setStatus(OrderStatus.READY);
        order.setDeliveryAgentId(10L);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        orderService.confirmPickupByRestaurant("ORD-1");

        assertTrue(order.getRestaurantPickupConfirmed());
    }

    @Test
    void confirmPickupAgent_success() {
        order.setStatus(OrderStatus.READY);
        order.setDeliveryAgentId(10L);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        orderService.confirmPickupByAgent("ORD-1", 10L);

        assertTrue(order.getAgentPickupConfirmed());
    }

    @Test
    void confirmPickup_wrongAgent() {
        order.setStatus(OrderStatus.READY);
        order.setDeliveryAgentId(10L);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> orderService.confirmPickupByAgent("ORD-1", 99L));
    }

    // ================= REORDER =================

    @Test
    void reorder_success() {
        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        OrderDTO result = orderService.reorderFromHistory("ORD-1");

        assertNotNull(result);
    }

    // ================= GET =================

    @Test
    void getOrder_success() {
        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));

        OrderDTO dto = orderService.getOrder("ORD-1");

        assertNotNull(dto);
    }

    @Test
    void getAvailableOrders_success() {
        order.setStatus(OrderStatus.READY);

        when(orderRepository.findByStatusAndDeliveryAgentIdIsNullOrderByCreatedAtAsc(any()))
                .thenReturn(List.of(order));

        assertEquals(1, orderService.getAvailableOrdersForDelivery().size());
    }

    @Test
    void getOrderCount_success() {
        when(orderRepository.count()).thenReturn(5L);

        assertEquals(5, orderService.getOrderCount());
    }

    @Test
    void getCustomerOrders_success() {
        when(orderRepository.findCustomerOrderHistory(anyLong()))
                .thenReturn(List.of(order));

        List<OrderDTO> result = orderService.getCustomerOrders(1L);

        assertEquals(1, result.size());
    }

    @Test
    void getRestaurantActiveOrders_success() {
        when(orderRepository.findActiveOrdersByRestaurant(anyLong()))
                .thenReturn(List.of(order));

        List<OrderDTO> result = orderService.getRestaurantActiveOrders(1L);

        assertEquals(1, result.size());
    }

    @Test
    void getDeliveryAgentOrders_success() {
        when(orderRepository.findAllOrdersByDeliveryAgent(anyLong()))
                .thenReturn(List.of(order));

        List<OrderDTO> result = orderService.getDeliveryAgentOrders(10L);

        assertEquals(1, result.size());
    }

    @Test
    void getActiveOrders_success() {
        when(orderRepository.findByStatus(OrderStatus.PLACED))
                .thenReturn(List.of(order));

        List<OrderDTO> result = orderService.getActiveOrders();

        assertEquals(1, result.size());
    }

    @Test
    void updateStatus_toDelivered() {
        order.setStatus(OrderStatus.IN_TRANSIT);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        orderService.updateOrderStatus("ORD-1", OrderStatus.DELIVERED);

        assertEquals(OrderStatus.DELIVERED, order.getStatus());
        assertNotNull(order.getActualDeliveryTime());
    }

    @Test
    void updateStatus_toReady() {
        order.setStatus(OrderStatus.PREPARING);
        order.setRestaurantPickupConfirmed(true);
        order.setAgentPickupConfirmed(true);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        orderService.updateOrderStatus("ORD-1", OrderStatus.READY);

        assertEquals(OrderStatus.READY, order.getStatus());
        assertFalse(order.getRestaurantPickupConfirmed());
        assertFalse(order.getAgentPickupConfirmed());
    }

    @Test
    void updateStatus_toPickedUp_withoutConfirmations() {
        order.setStatus(OrderStatus.READY);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> orderService.updateOrderStatus("ORD-1", OrderStatus.PICKED_UP));
    }

    @Test
    void confirmPickupByRestaurant_noAgent() {
        order.setStatus(OrderStatus.READY);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> orderService.confirmPickupByRestaurant("ORD-1"));
    }

    @Test
    void confirmPickupByAgent_noAgent() {
        order.setStatus(OrderStatus.READY);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> orderService.confirmPickupByAgent("ORD-1", 10L));
    }

    @Test
    void confirmPickupByAgent_invalidStatus() {
        order.setStatus(OrderStatus.PLACED);
        order.setDeliveryAgentId(10L);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> orderService.confirmPickupByAgent("ORD-1", 10L));
    }

    @Test
    void confirmPickupByRestaurant_invalidStatus() {
        order.setStatus(OrderStatus.PLACED);
        order.setDeliveryAgentId(10L);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> orderService.confirmPickupByRestaurant("ORD-1"));
    }

    @Test
    void assignAgent_alreadyAssigned() {
        order.setStatus(OrderStatus.READY);
        order.setDeliveryAgentId(5L);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> orderService.assignDeliveryAgent("ORD-1", 10L));
    }

    @Test
    void confirmPickup_bothConfirmed_promotesToPickedUp() {
        order.setStatus(OrderStatus.READY);
        order.setDeliveryAgentId(10L);
        order.setRestaurantPickupConfirmed(true);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        orderService.confirmPickupByAgent("ORD-1", 10L);

        assertEquals(OrderStatus.PICKED_UP, order.getStatus());
    }

    @Test
    void getOrder_notFound() {
        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> orderService.getOrder("ORD-1"));
    }

    @Test
    void placeOrder_withItems() {
        CreateOrderRequest req = new CreateOrderRequest();
        req.setCustomerId(1L);
        req.setRestaurantId(1L);
        req.setTotalAmount(100.0);
        req.setDeliveryCharge(20.0);
        req.setDiscountAmount(10.0);
        req.setItems(List.of(
            OrderItemDTO.builder()
                .menuItemId(1L)
                .itemName("Pizza")
                .quantity(2)
                .price(50.0)
                .build()
        ));

        when(orderRepository.save(any())).thenReturn(order);

        OrderDTO result = orderService.placeOrder(req);

        assertNotNull(result);
        verify(orderRepository).save(any());
    }
}