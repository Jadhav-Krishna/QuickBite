package com.quickbite.repository;

import com.quickbite.entity.Order;
import com.quickbite.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByCustomerId(Long customerId);

    List<Order> findByCustomerIdAndStatus(Long customerId, OrderStatus status);

    List<Order> findByRestaurantId(Long restaurantId);

    List<Order> findByDeliveryAgentId(Long deliveryAgentId);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByStatusAndDeliveryAgentIdIsNullOrderByCreatedAtAsc(OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.customerId = :customerId ORDER BY o.createdAt DESC")
    List<Order> findCustomerOrderHistory(@Param("customerId") Long customerId);

    @Query("SELECT o FROM Order o WHERE o.restaurantId = :restaurantId ORDER BY o.createdAt DESC")
    List<Order> findActiveOrdersByRestaurant(@Param("restaurantId") Long restaurantId);

    @Query("SELECT o FROM Order o WHERE o.deliveryAgentId = :agentId AND o.status NOT IN ('DELIVERED', 'CANCELLED') ORDER BY o.estimatedDeliveryTime ASC")
    List<Order> findActiveOrdersByDeliveryAgent(@Param("agentId") Long agentId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.customerId = :customerId AND o.status = 'DELIVERED'")
    long countDeliveredOrdersByCustomer(@Param("customerId") Long customerId);

    @Query("SELECT AVG(o.finalAmount) FROM Order o WHERE o.restaurantId = :restaurantId AND o.createdAt >= :fromDate")
    Double getAverageOrderValueByRestaurant(@Param("restaurantId") Long restaurantId, @Param("fromDate") LocalDateTime fromDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate AND o.status = 'DELIVERED'")
    long countOrdersInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    long countByRestaurantId(Long restaurantId);
}
