package com.quickbite.service;

import com.quickbite.dto.OrderDTO;
import com.quickbite.entity.Order;
import com.quickbite.entity.OrderStatus;
import com.quickbite.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
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

    @InjectMocks
    private OrderService orderService;

    private Order testOrder;

    @BeforeEach
    void setUp() {
        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setUserId(1L);
        testOrder.setRestaurantId(1L);
        testOrder.setStatus(OrderStatus.PENDING);
        testOrder.setTotalAmount(new BigDecimal("100.00"));
    }

    @Test
    void getOrderById_Success() {
        when(orderRepository.findById(anyLong())).thenReturn(Optional.of(testOrder));

        OrderDTO result = orderService.getOrderById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(orderRepository).findById(1L);
    }

    @Test
    void getOrderById_NotFound() {
        when(orderRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> orderService.getOrderById(1L));
    }

    @Test
    void getUserOrders_Success() {
        when(orderRepository.findByUserId(anyLong())).thenReturn(Arrays.asList(testOrder));

        List<OrderDTO> results = orderService.getUserOrders(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(orderRepository).findByUserId(1L);
    }

    @Test
    void getRestaurantOrders_Success() {
        when(orderRepository.findByRestaurantId(anyLong())).thenReturn(Arrays.asList(testOrder));

        List<OrderDTO> results = orderService.getRestaurantOrders(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(orderRepository).findByRestaurantId(1L);
    }

    @Test
    void updateOrderStatus_Success() {
        when(orderRepository.findById(anyLong())).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        OrderDTO result = orderService.updateOrderStatus(1L, OrderStatus.CONFIRMED);

        assertNotNull(result);
        assertEquals(OrderStatus.CONFIRMED, testOrder.getStatus());
        verify(orderRepository).save(testOrder);
    }

    @Test
    void cancelOrder_Success() {
        when(orderRepository.findById(anyLong())).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        orderService.cancelOrder(1L);

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
