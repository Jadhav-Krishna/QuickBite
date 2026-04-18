package com.quickbite.repository;

import com.quickbite.entity.ShoppingCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<ShoppingCart, Long> {
    Optional<ShoppingCart> findByCustomerIdAndRestaurantIdAndIsActiveTrue(
            Long customerId, Long restaurantId);

    Optional<ShoppingCart> findByCustomerIdAndIsActiveTrue(Long customerId);

    Optional<ShoppingCart> findByCustomerId(Long customerId);
}
