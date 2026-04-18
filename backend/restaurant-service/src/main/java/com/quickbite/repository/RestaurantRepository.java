package com.quickbite.repository;

import com.quickbite.entity.Restaurant;
import org.locationtech.jts.geom.Point;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByOwnerId(Long ownerId);

    List<Restaurant> findByCity(String city);

    List<Restaurant> findByCuisineType(String cuisineType);

    List<Restaurant> findByNameContainingIgnoreCase(String keyword);

    List<Restaurant> findByIsApproved(Boolean isApproved);

    List<Restaurant> findByIsActiveAndIsApproved(Boolean isActive, Boolean isApproved);

    @Query(value = "SELECT * FROM restaurants WHERE is_active = true AND is_approved = true " +
                   "AND ST_Distance_Sphere(location, :userLocation) <= :radiusInMeters " +
                   "ORDER BY rating DESC LIMIT :limit",
           nativeQuery = true)
    List<Restaurant> findRestaurantsByLocation(
            @Param("userLocation") Point userLocation,
            @Param("radiusInMeters") double radiusInMeters,
            @Param("limit") int limit);

    @Query(value = "SELECT * FROM restaurants WHERE is_active = true AND is_approved = true " +
                   "AND ST_Distance_Sphere(location, :userLocation) <= :radiusInMeters " +
                   "AND cuisine_type = :cuisineType " +
                   "ORDER BY rating DESC LIMIT :limit",
           nativeQuery = true)
    List<Restaurant> findRestaurantsByLocationAndCuisine(
            @Param("userLocation") Point userLocation,
            @Param("radiusInMeters") double radiusInMeters,
            @Param("cuisineType") String cuisineType,
            @Param("limit") int limit);

    long countByCity(String city);

    long countByIsApproved(Boolean isApproved);
}
