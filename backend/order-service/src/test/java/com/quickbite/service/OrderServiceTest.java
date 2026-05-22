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

import java.lang.reflect.Method;
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
        order.setTotalAmount(100.0);
        order.setDeliveryCharge(0.0);
        order.setDiscountAmount(0.0);
        order.setPaymentMethod(PaymentMethod.UPI);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setPaymentCompleted(false);
        order.setRestaurantPickupConfirmed(false);
        order.setAgentPickupConfirmed(false);
        order.setItems(new ArrayList<>());
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

    @Test
    void confirmOrder_notFound() {
        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.confirmOrder("ORD-404"));

        assertEquals("Order not found: ORD-404", exception.getMessage());
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
    void updateStatus_coversAllValidTransitionsAndEvents() {
        assertValidTransition(OrderStatus.PLACED, OrderStatus.CANCELLED);
        assertValidTransition(OrderStatus.CONFIRMED, OrderStatus.PREPARING);
        assertValidTransition(OrderStatus.CONFIRMED, OrderStatus.CANCELLED);
        assertValidTransition(OrderStatus.PREPARING, OrderStatus.CANCELLED);
        assertValidTransition(OrderStatus.READY, OrderStatus.CANCELLED);
        assertValidTransition(OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT);
        assertValidTransition(OrderStatus.PICKED_UP, OrderStatus.CANCELLED);
        assertValidTransition(OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED);
    }

    @Test
    void updateStatus_toPickedUpWithConfirmations() {
        order.setStatus(OrderStatus.READY);
        order.setRestaurantPickupConfirmed(true);
        order.setAgentPickupConfirmed(true);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        OrderDTO result = orderService.updateOrderStatus("ORD-1", OrderStatus.PICKED_UP);

        assertEquals(OrderStatus.PICKED_UP, result.getStatus());
    }

    @Test
    void updateStatus_notFound() {
        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.updateOrderStatus("ORD-404", OrderStatus.CONFIRMED));

        assertEquals("Order not found: ORD-404", exception.getMessage());
    }

    @Test
    void updateStatus_fromTerminalStatusesIsInvalid() {
        assertInvalidTransition(OrderStatus.CONFIRMED, OrderStatus.DELIVERED);
        assertInvalidTransition(OrderStatus.PREPARING, OrderStatus.DELIVERED);
        assertInvalidTransition(OrderStatus.READY, OrderStatus.DELIVERED);
        assertInvalidTransition(OrderStatus.PICKED_UP, OrderStatus.DELIVERED);
        assertInvalidTransition(OrderStatus.IN_TRANSIT, OrderStatus.CONFIRMED);
        assertInvalidTransition(OrderStatus.DELIVERED, OrderStatus.CANCELLED);
        assertInvalidTransition(OrderStatus.CANCELLED, OrderStatus.CONFIRMED);
        assertInvalidTransition(OrderStatus.FAILED, OrderStatus.CONFIRMED);
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

    @Test
    void assignAgent_notFound() {
        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.assignDeliveryAgent("ORD-404", 10L));

        assertEquals("Order not found: ORD-404", exception.getMessage());
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

    @Test
    void cancelOrder_alreadyCancelledInvalid() {
        order.setStatus(OrderStatus.CANCELLED);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.cancelOrder("ORD-1", "test"));

        assertEquals("Cannot cancel order with status: CANCELLED", exception.getMessage());
    }

    @Test
    void cancelOrder_notFound() {
        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.cancelOrder("ORD-404", "test"));

        assertEquals("Order not found: ORD-404", exception.getMessage());
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
    void confirmPickupRestaurant_alreadyConfirmedDoesNotSaveAgain() {
        order.setStatus(OrderStatus.PICKED_UP);
        order.setDeliveryAgentId(10L);
        order.setRestaurantPickupConfirmed(true);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));

        OrderDTO result = orderService.confirmPickupByRestaurant("ORD-1");

        assertTrue(result.getRestaurantPickupConfirmed());
        verify(orderRepository, never()).save(any());
    }

    @Test
    void confirmPickupRestaurant_onPickedUpOrderDoesNotPromoteAgain() {
        order.setStatus(OrderStatus.PICKED_UP);
        order.setDeliveryAgentId(10L);
        order.setAgentPickupConfirmed(true);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        OrderDTO result = orderService.confirmPickupByRestaurant("ORD-1");

        assertEquals(OrderStatus.PICKED_UP, result.getStatus());
        assertTrue(result.getRestaurantPickupConfirmed());
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
    void confirmPickupAgent_alreadyConfirmedDoesNotSaveAgain() {
        order.setStatus(OrderStatus.PICKED_UP);
        order.setDeliveryAgentId(10L);
        order.setAgentPickupConfirmed(true);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));

        OrderDTO result = orderService.confirmPickupByAgent("ORD-1", 10L);

        assertTrue(result.getAgentPickupConfirmed());
        verify(orderRepository, never()).save(any());
    }

    @Test
    void confirmPickupRestaurant_notFound() {
        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.confirmPickupByRestaurant("ORD-404"));

        assertEquals("Order not found: ORD-404", exception.getMessage());
    }

    @Test
    void confirmPickupAgent_notFound() {
        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.confirmPickupByAgent("ORD-404", 10L));

        assertEquals("Order not found: ORD-404", exception.getMessage());
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
        OrderItem item = new OrderItem();
        item.setMenuItemId(2L);
        item.setItemName("Burger");
        item.setQuantity(1);
        item.setPrice(80.0);
        item.setSpecialInstructions("No onion");
        order.addItem(item);

        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        OrderDTO result = orderService.reorderFromHistory("ORD-1");

        assertNotNull(result);
    }

    @Test
    void reorder_notFound() {
        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.reorderFromHistory("ORD-404"));

        assertEquals("Order not found: ORD-404", exception.getMessage());
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
    void updateStatus_toPickedUp_requiresAgentConfirmationToo() {
        order.setStatus(OrderStatus.READY);
        order.setRestaurantPickupConfirmed(true);
        order.setAgentPickupConfirmed(false);

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

    @Test
    void placeOrder_defaultsAmountsAndPaymentMethodWhenMissing() {
        CreateOrderRequest req = new CreateOrderRequest();
        req.setCustomerId(1L);
        req.setRestaurantId(1L);
        when(orderRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        OrderDTO result = orderService.placeOrder(req);

        assertEquals(0.0, result.getTotalAmount());
        assertEquals(0.0, result.getDeliveryCharge());
        assertEquals(0.0, result.getDiscountAmount());
        assertEquals(0.0, result.getFinalAmount());
        assertEquals(PaymentMethod.CASH_ON_DELIVERY, result.getPaymentMethod());
        assertEquals(PaymentStatus.PENDING, result.getPaymentStatus());
    }

    @Test
    void placeOrder_calculatesFinalAmountWithFloorAtZero() {
        CreateOrderRequest req = new CreateOrderRequest();
        req.setCustomerId(1L);
        req.setRestaurantId(1L);
        req.setTotalAmount(20.0);
        req.setDeliveryCharge(5.0);
        req.setDiscountAmount(100.0);
        req.setPaymentMethod("card");
        when(orderRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        OrderDTO result = orderService.placeOrder(req);

        assertEquals(0.0, result.getFinalAmount());
        assertEquals(PaymentMethod.CREDIT_CARD, result.getPaymentMethod());
    }

    @Test
    void placeOrder_mapsSupportedPaymentMethodAliases() {
        assertPaymentMethod("COD", PaymentMethod.CASH_ON_DELIVERY);
        assertPaymentMethod("CREDIT_CARD", PaymentMethod.CREDIT_CARD);
        assertPaymentMethod("DEBIT_CARD", PaymentMethod.DEBIT_CARD);
        assertPaymentMethod("UPI", PaymentMethod.UPI);
        assertPaymentMethod("ONLINE", PaymentMethod.UPI);
        assertPaymentMethod("WALLET", PaymentMethod.WALLET);
        assertPaymentMethod("NETBANKING", PaymentMethod.NET_BANKING);
        assertPaymentMethod("NET_BANKING", PaymentMethod.NET_BANKING);
        assertPaymentMethod("unknown", PaymentMethod.CASH_ON_DELIVERY);
    }

    @Test
    void placeOrder_ignoresNullOrEmptyItems() {
        CreateOrderRequest nullItems = CreateOrderRequest.builder()
                .customerId(1L)
                .restaurantId(1L)
                .items(null)
                .build();
        CreateOrderRequest emptyItems = CreateOrderRequest.builder()
                .customerId(1L)
                .restaurantId(1L)
                .items(List.of())
                .build();
        when(orderRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        assertTrue(orderService.placeOrder(nullItems).getItems().isEmpty());
        assertTrue(orderService.placeOrder(emptyItems).getItems().isEmpty());
    }

    @Test
    void placeOrder_ignoresPublishFailure() {
        CreateOrderRequest req = CreateOrderRequest.builder()
                .customerId(1L)
                .restaurantId(1L)
                .finalAmount(100.0)
                .paymentMethod("UPI")
                .build();
        when(orderRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        doThrow(new RuntimeException("RabbitMQ down")).when(rabbitTemplate).convertAndSend(anyString(), anyString(), any(OrderEvent.class));

        assertDoesNotThrow(() -> orderService.placeOrder(req));
    }

    @Test
    void resolveEventTypeForUnreachableStatuses() throws Exception {
        Method resolver = OrderService.class.getDeclaredMethod("resolveEventTypeForStatus", OrderStatus.class);
        resolver.setAccessible(true);

        assertEquals(OrderEvent.EventType.ORDER_PLACED.name(), resolver.invoke(orderService, OrderStatus.PLACED));
        assertEquals("ORDER_FAILED", resolver.invoke(orderService, OrderStatus.FAILED));
    }

    private void assertPaymentMethod(String method, PaymentMethod expected) {
        CreateOrderRequest req = CreateOrderRequest.builder()
                .customerId(1L)
                .restaurantId(1L)
                .paymentMethod(method)
                .build();
        when(orderRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        assertEquals(expected, orderService.placeOrder(req).getPaymentMethod());
    }

    private void assertValidTransition(OrderStatus from, OrderStatus to) {
        Order transitioningOrder = baseOrder(from);
        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(transitioningOrder));
        when(orderRepository.save(any())).thenReturn(transitioningOrder);

        assertEquals(to, orderService.updateOrderStatus("ORD-1", to).getStatus());
    }

    private void assertInvalidTransition(OrderStatus from, OrderStatus to) {
        Order transitioningOrder = baseOrder(from);
        when(orderRepository.findByOrderNumber(any()))
                .thenReturn(Optional.of(transitioningOrder));

        assertThrows(RuntimeException.class, () -> orderService.updateOrderStatus("ORD-1", to));
    }

    private Order baseOrder(OrderStatus status) {
        Order base = new Order();
        base.setId(1L);
        base.setOrderNumber("ORD-1");
        base.setCustomerId(1L);
        base.setRestaurantId(1L);
        base.setStatus(status);
        base.setTotalAmount(100.0);
        base.setDeliveryCharge(0.0);
        base.setDiscountAmount(0.0);
        base.setFinalAmount(100.0);
        base.setPaymentMethod(PaymentMethod.UPI);
        base.setPaymentStatus(PaymentStatus.PENDING);
        base.setRestaurantPickupConfirmed(false);
        base.setAgentPickupConfirmed(false);
        base.setItems(new ArrayList<>());
        return base;
    }
}
