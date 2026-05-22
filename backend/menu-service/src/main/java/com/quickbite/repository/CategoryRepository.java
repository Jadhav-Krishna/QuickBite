package com.quickbite.repository;

import com.quickbite.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByRestaurantId(Long restaurantId);

    List<Category> findByRestaurantIdAndIsActiveTrue(Long restaurantId);

    long countByRestaurantId(Long restaurantId);
}
