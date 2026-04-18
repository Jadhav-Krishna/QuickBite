package com.quickbite.repository;

import com.quickbite.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByOrderId(Long orderId);
    List<Review> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
    List<Review> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Review> findByDeliveryAgentIdOrderByCreatedAtDesc(Long deliveryAgentId);

    @Query("SELECT AVG(r.restaurantRating) FROM Review r WHERE r.restaurantId = :restaurantId")
    Double getAverageRestaurantRating(Long restaurantId);

    @Query("SELECT AVG(r.deliveryRating) FROM Review r WHERE r.deliveryAgentId = :deliveryAgentId AND r.deliveryRating IS NOT NULL")
    Double getAverageDeliveryRating(Long deliveryAgentId);
}
