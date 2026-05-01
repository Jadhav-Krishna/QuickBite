package com.quickbite.service;

import com.quickbite.dto.OrderDTO;
import com.quickbite.entity.*;
import com.quickbite.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private OrderService orderService;

    private Order testOrder;

    @BeforeEach
    void setUp() {
        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setOrderNumber("ORD-001");
        testOrder.setCustomerId(1L);
        testOrder.setRestaurantId(1L);
        testOrder.setStatus(OrderStatus.PLACED);
        testOrder.setTotalAmount(100.0);
        testOrder.setFinalAmount(100.0);
        testOrder.setPaymentMethod(PaymentMethod.UPI);
        testOrder.setPaymentStatus(PaymentStatus.PENDING);
        testOrder.setRestaurantPickupConfirmed(false);
        testOrder.setAgentPickupConfirmed(false);
    }

    @Test
    void getOrderById_Success() {
        when(orderRepository.findByOrderNumber(anyString())).thenReturn(Optional.of(testOrder));

        OrderDTO result = orderService.getOrder("ORD-001");

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(orderRepository).findByOrderNumber("ORD-001");
    }

    @Test
    void getOrderById_NotFound() {
        when(orderRepository.findByOrderNumber(anyString())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> orderService.getOrder("ORD-999"));
    }

    @Test
    void getUserOrders_Success() {
        when(orderRepository.findCustomerOrderHistory(anyLong())).thenReturn(Arrays.asList(testOrder));

        List<OrderDTO> results = orderService.getCustomerOrders(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(orderRepository).findCustomerOrderHistory(1L);
    }

    @Test
    void getRestaurantOrders_Success() {
        when(orderRepository.findActiveOrdersByRestaurant(anyLong())).thenReturn(Arrays.asList(testOrder));

        List<OrderDTO> results = orderService.getRestaurantActiveOrders(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(orderRepository).findActiveOrdersByRestaurant(1L);
    }

    @Test
    void updateOrderStatus_Success() {
        when(orderRepository.findByOrderNumber(anyString())).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        OrderDTO result = orderService.updateOrderStatus("ORD-001", OrderStatus.CONFIRMED);

        assertNotNull(result);
        assertEquals(OrderStatus.CONFIRMED, testOrder.getStatus());
        verify(orderRepository).save(testOrder);
    }

    @Test
    void cancelOrder_Success() {
        when(orderRepository.findByOrderNumber(anyString())).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        orderService.cancelOrder("ORD-001", "Customer request");

        assertEquals(OrderStatus.CANCELLED, testOrder.getStatus());
        verify(orderRepository).save(testOrder);
    }

    @Test
    void getActiveOrders_Success() {
        when(orderRepository.findByStatus(any(OrderStatus.class))).thenReturn(Arrays.asList(testOrder));

        List<OrderDTO> results = orderService.getActiveOrders();

        assertNotNull(results);
        assertFalse(results.isEmpty());
    }
}
