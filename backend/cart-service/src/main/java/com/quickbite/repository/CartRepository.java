package com.quickbite.repository;

import com.quickbite.entity.ShoppingCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<ShoppingCart, Long> {
    Optional<ShoppingCart> findFirstByCustomerIdAndRestaurantIdAndIsActiveTrue(
            Long customerId, Long restaurantId);

    Optional<ShoppingCart> findFirstByCustomerIdAndIsActiveTrue(Long customerId);

    Optional<ShoppingCart> findFirstByCustomerId(Long customerId);

    List<ShoppingCart> findAllByCustomerIdAndRestaurantIdAndIsActiveTrue(
            Long customerId, Long restaurantId);

    List<ShoppingCart> findAllByCustomerIdAndIsActiveTrue(Long customerId);

    @Modifying
    @Query("UPDATE ShoppingCart c SET c.isActive = false WHERE c.customerId = :customerId AND c.restaurantId = :restaurantId AND c.isActive = true AND c.id <> :keepId")
    void deactivateDuplicateCarts(@Param("customerId") Long customerId, @Param("restaurantId") Long restaurantId, @Param("keepId") Long keepId);

    @Modifying
    @Query("UPDATE ShoppingCart c SET c.isActive = false WHERE c.customerId = :customerId AND c.isActive = true AND c.id <> :keepId")
    void deactivateDuplicateCartsByCustomer(@Param("customerId") Long customerId, @Param("keepId") Long keepId);
}
