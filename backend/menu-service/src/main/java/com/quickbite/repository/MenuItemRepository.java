package com.quickbite.repository;

import com.quickbite.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByRestaurantId(Long restaurantId);

    List<MenuItem> findByCategoryId(Long categoryId);

    List<MenuItem> findByRestaurantIdAndCategoryId(Long restaurantId, Long categoryId);

    @Query("SELECT m FROM MenuItem m WHERE m.restaurantId = :restaurantId AND m.isAvailable = true ORDER BY m.rating DESC")
    List<MenuItem> findAvailableItemsByRestaurant(@Param("restaurantId") Long restaurantId);

    @Query("SELECT m FROM MenuItem m WHERE m.categoryId = :categoryId AND m.isAvailable = true ORDER BY m.rating DESC LIMIT :limit")
    List<MenuItem> findTopItemsByCategory(@Param("categoryId") Long categoryId, @Param("limit") int limit);

    List<MenuItem> findByIsVegetarian(Boolean isVegetarian);

    List<MenuItem> findByRestaurantIdAndIsVegetarian(Long restaurantId, Boolean isVegetarian);

    List<MenuItem> findByNameContainingIgnoreCase(String keyword);
}
