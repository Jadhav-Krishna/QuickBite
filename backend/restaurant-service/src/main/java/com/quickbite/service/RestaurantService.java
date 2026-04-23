package com.quickbite.service;

import com.quickbite.entity.Restaurant;
import com.quickbite.repository.RestaurantRepository;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@Slf4j
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    private static final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    public Restaurant createRestaurant(Restaurant restaurant) {
        log.info("Creating restaurant: {} for owner: {}", restaurant.getName(), restaurant.getOwnerId());

        if (restaurant.getLocation() == null) {
            throw new RuntimeException("Restaurant location (latitude/longitude) is required");
        }
        if (restaurant.getName() == null || restaurant.getName().isBlank()) {
            throw new RuntimeException("Restaurant name is required");
        }
        if (restaurant.getCuisineType() == null || restaurant.getCuisineType().isBlank()) {
            throw new RuntimeException("Cuisine type is required");
        }
        if (restaurant.getAddress() == null || restaurant.getAddress().isBlank()) {
            throw new RuntimeException("Address is required");
        }
        if (restaurant.getCity() == null || restaurant.getCity().isBlank()) {
            throw new RuntimeException("City is required");
        }
        if (restaurant.getState() == null || restaurant.getState().isBlank()) {
            throw new RuntimeException("State is required");
        }
        if (restaurant.getPincode() == null || restaurant.getPincode().isBlank()) {
            throw new RuntimeException("Pincode is required");
        }
        if (restaurant.getPhoneNumber() == null || restaurant.getPhoneNumber().isBlank()) {
            throw new RuntimeException("Phone number is required");
        }
        if (restaurant.getEmail() == null || restaurant.getEmail().isBlank()) {
            throw new RuntimeException("Email is required");
        }
        if (restaurant.getImageUrl() == null || restaurant.getImageUrl().isBlank()) {
            restaurant.setImageUrl("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80");
        }

        restaurant.setIsActive(true);
        restaurant.setIsOpen(false);
        restaurant.setIsApproved(false);
        restaurant.setRating(0.0);
        restaurant.setReviewCount(0);

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        log.info("Restaurant created with ID: {}", savedRestaurant.getId());

        return savedRestaurant;
    }

    @Transactional(readOnly = true)
    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Restaurant> getRestaurantsByOwner(Long ownerId) {
        return restaurantRepository.findByOwnerId(ownerId);
    }

    @Transactional(readOnly = true)
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Restaurant> getActiveRestaurants() {
        return restaurantRepository.findByIsActiveAndIsApproved(true, true);
    }

    @Transactional(readOnly = true)
    public List<Restaurant> searchRestaurants(String keyword) {
        return restaurantRepository.findByNameContainingIgnoreCase(keyword);
    }

    @Transactional(readOnly = true)
    public List<Restaurant> getNearbyRestaurants(double latitude, double longitude, double radiusKm) {
        Point userLocation = geometryFactory.createPoint(new Coordinate(longitude, latitude));
        double radiusInMeters = radiusKm * 1000;
        return restaurantRepository.findRestaurantsByLocation(userLocation, radiusInMeters, 50);
    }

    @Transactional(readOnly = true)
    public List<Restaurant> getNearbyRestaurantsByCuisine(
            double latitude, double longitude, double radiusKm, String cuisineType) {
        Point userLocation = geometryFactory.createPoint(new Coordinate(longitude, latitude));
        double radiusInMeters = radiusKm * 1000;
        return restaurantRepository.findRestaurantsByLocationAndCuisine(
                userLocation, radiusInMeters, cuisineType, 50);
    }

    @Transactional(readOnly = true)
    public List<Restaurant> getRestaurantsByCity(String city) {
        return restaurantRepository.findByCity(city);
    }

    @Transactional(readOnly = true)
    public List<Restaurant> getRestaurantsByCuisine(String cuisineType) {
        return restaurantRepository.findByCuisineType(cuisineType);
    }

    public Restaurant updateRestaurant(Long id, Restaurant updatedRestaurant) {
        Restaurant existingRestaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + id));

        if (updatedRestaurant.getName() != null) {
            existingRestaurant.setName(updatedRestaurant.getName());
        }
        if (updatedRestaurant.getCuisineType() != null) {
            existingRestaurant.setCuisineType(updatedRestaurant.getCuisineType());
        }
        if (updatedRestaurant.getDescription() != null) {
            existingRestaurant.setDescription(updatedRestaurant.getDescription());
        }
        if (updatedRestaurant.getAddress() != null) {
            existingRestaurant.setAddress(updatedRestaurant.getAddress());
        }
        if (updatedRestaurant.getCity() != null) {
            existingRestaurant.setCity(updatedRestaurant.getCity());
        }
        if (updatedRestaurant.getState() != null) {
            existingRestaurant.setState(updatedRestaurant.getState());
        }
        if (updatedRestaurant.getPincode() != null) {
            existingRestaurant.setPincode(updatedRestaurant.getPincode());
        }
        if (updatedRestaurant.getPhoneNumber() != null) {
            existingRestaurant.setPhoneNumber(updatedRestaurant.getPhoneNumber());
        }
        if (updatedRestaurant.getEmail() != null) {
            existingRestaurant.setEmail(updatedRestaurant.getEmail());
        }
        if (updatedRestaurant.getDeliveryFee() != null) {
            existingRestaurant.setDeliveryFee(updatedRestaurant.getDeliveryFee());
        }
        if (updatedRestaurant.getDeliveryRadius() != null) {
            existingRestaurant.setDeliveryRadius(updatedRestaurant.getDeliveryRadius());
        }
        if (updatedRestaurant.getMinOrderAmount() != null) {
            existingRestaurant.setMinOrderAmount(updatedRestaurant.getMinOrderAmount());
        }
        if (updatedRestaurant.getMinDeliveryTime() != null) {
            existingRestaurant.setMinDeliveryTime(updatedRestaurant.getMinDeliveryTime());
        }
        if (updatedRestaurant.getMaxDeliveryTime() != null) {
            existingRestaurant.setMaxDeliveryTime(updatedRestaurant.getMaxDeliveryTime());
        }
        if (updatedRestaurant.getImageUrl() != null) {
            existingRestaurant.setImageUrl(updatedRestaurant.getImageUrl());
        }
        if (updatedRestaurant.getEstimatedDeliveryMin() != null) {
            existingRestaurant.setEstimatedDeliveryMin(updatedRestaurant.getEstimatedDeliveryMin());
        }
        if (updatedRestaurant.getCuisines() != null) {
            existingRestaurant.setCuisines(updatedRestaurant.getCuisines());
        }
        if (updatedRestaurant.getOpeningTime() != null) {
            existingRestaurant.setOpeningTime(updatedRestaurant.getOpeningTime());
        }
        if (updatedRestaurant.getClosingTime() != null) {
            existingRestaurant.setClosingTime(updatedRestaurant.getClosingTime());
        }
        if (updatedRestaurant.getIsOpen() != null) {
            existingRestaurant.setIsOpen(updatedRestaurant.getIsOpen());
        }
        if (updatedRestaurant.getIsActive() != null) {
            existingRestaurant.setIsActive(updatedRestaurant.getIsActive());
        }
        if (updatedRestaurant.getLocation() != null) {
            existingRestaurant.setLocation(updatedRestaurant.getLocation());
        }

        return restaurantRepository.save(existingRestaurant);
    }

    public Restaurant approveRestaurant(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + id));
        restaurant.setIsApproved(true);
        log.info("Restaurant approved: {}", id);
        return restaurantRepository.save(restaurant);
    }

    public Restaurant toggleOpen(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + id));

        if (!restaurant.getIsApproved()) {
            throw new RuntimeException("Cannot open restaurant that is not approved");
        }

        restaurant.setIsOpen(!restaurant.getIsOpen());
        log.info("Restaurant {} is now {}", id, restaurant.getIsOpen() ? "OPEN" : "CLOSED");
        return restaurantRepository.save(restaurant);
    }

    public Restaurant toggleActive(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + id));
        restaurant.setIsActive(!restaurant.getIsActive());
        return restaurantRepository.save(restaurant);
    }

    public Restaurant updateRating(Long restaurantId, Double newAvgRating, Integer newReviewCount) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + restaurantId));
        restaurant.setRating(newAvgRating);
        restaurant.setReviewCount(newReviewCount);
        log.info("Updated rating for restaurant {}: {} ({} reviews)", restaurantId, newAvgRating, newReviewCount);
        return restaurantRepository.save(restaurant);
    }

    public void deleteRestaurant(Long id) {
        if (!restaurantRepository.existsById(id)) {
            throw new RuntimeException("Restaurant not found with id: " + id);
        }
        restaurantRepository.deleteById(id);
        log.info("Restaurant deleted: {}", id);
    }
}
