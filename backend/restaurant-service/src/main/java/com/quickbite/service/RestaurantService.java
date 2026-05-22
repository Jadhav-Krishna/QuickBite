package com.quickbite.service;

import com.quickbite.entity.Restaurant;
import com.quickbite.exception.InvalidRestaurantDataException;
import com.quickbite.exception.RestaurantNotApprovedException;
import com.quickbite.exception.RestaurantNotFoundException;
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
    private static final String RESTAURANT_NOT_FOUND = "Restaurant not found with id: ";

    public Restaurant createRestaurant(Restaurant restaurant) {
        log.info("Creating restaurant: {} for owner: {}", restaurant.getName(), restaurant.getOwnerId());

        validateRestaurantData(restaurant);

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

    private void validateRestaurantData(Restaurant restaurant) {
        validateLocation(restaurant.getLocation());
        validateRequiredField(restaurant.getName(), "Restaurant name");
        validateRequiredField(restaurant.getCuisineType(), "Cuisine type");
        validateRequiredField(restaurant.getAddress(), "Address");
        validateRequiredField(restaurant.getCity(), "City");
        validateRequiredField(restaurant.getState(), "State");
        validateRequiredField(restaurant.getPincode(), "Pincode");
        validateRequiredField(restaurant.getPhoneNumber(), "Phone number");
        validateRequiredField(restaurant.getEmail(), "Email");
    }

    private void validateLocation(Point location) {
        if (location == null) {
            throw new InvalidRestaurantDataException("Restaurant location (latitude/longitude) is required");
        }
    }

    private void validateRequiredField(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new InvalidRestaurantDataException(fieldName + " is required");
        }
    }

    @Transactional(readOnly = true)
    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RestaurantNotFoundException(RESTAURANT_NOT_FOUND + id));
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
                .orElseThrow(() -> new RestaurantNotFoundException(RESTAURANT_NOT_FOUND + id));

        updateRestaurantFields(existingRestaurant, updatedRestaurant);

        return restaurantRepository.save(existingRestaurant);
    }

    private void updateRestaurantFields(Restaurant existing, Restaurant updated) {
        updateBasicFields(existing, updated);
        updateLocationFields(existing, updated);
        updateDeliveryFields(existing, updated);
        updateOperationalFields(existing, updated);
    }

    private void updateBasicFields(Restaurant existing, Restaurant updated) {
        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getCuisineType() != null) existing.setCuisineType(updated.getCuisineType());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getCuisines() != null) existing.setCuisines(updated.getCuisines());
        if (updated.getImageUrl() != null) existing.setImageUrl(updated.getImageUrl());
    }

    private void updateLocationFields(Restaurant existing, Restaurant updated) {
        if (updated.getAddress() != null) existing.setAddress(updated.getAddress());
        if (updated.getCity() != null) existing.setCity(updated.getCity());
        if (updated.getState() != null) existing.setState(updated.getState());
        if (updated.getPincode() != null) existing.setPincode(updated.getPincode());
        if (updated.getLocation() != null) existing.setLocation(updated.getLocation());
    }

    private void updateDeliveryFields(Restaurant existing, Restaurant updated) {
        if (updated.getDeliveryFee() != null) existing.setDeliveryFee(updated.getDeliveryFee());
        if (updated.getDeliveryRadius() != null) existing.setDeliveryRadius(updated.getDeliveryRadius());
        if (updated.getMinOrderAmount() != null) existing.setMinOrderAmount(updated.getMinOrderAmount());
        if (updated.getMinDeliveryTime() != null) existing.setMinDeliveryTime(updated.getMinDeliveryTime());
        if (updated.getMaxDeliveryTime() != null) existing.setMaxDeliveryTime(updated.getMaxDeliveryTime());
        if (updated.getEstimatedDeliveryMin() != null) existing.setEstimatedDeliveryMin(updated.getEstimatedDeliveryMin());
    }

    private void updateOperationalFields(Restaurant existing, Restaurant updated) {
        if (updated.getPhoneNumber() != null) existing.setPhoneNumber(updated.getPhoneNumber());
        if (updated.getEmail() != null) existing.setEmail(updated.getEmail());
        if (updated.getOpeningTime() != null) existing.setOpeningTime(updated.getOpeningTime());
        if (updated.getClosingTime() != null) existing.setClosingTime(updated.getClosingTime());
        if (updated.getIsOpen() != null) existing.setIsOpen(updated.getIsOpen());
        if (updated.getIsActive() != null) existing.setIsActive(updated.getIsActive());
    }

    public Restaurant approveRestaurant(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RestaurantNotFoundException(RESTAURANT_NOT_FOUND + id));
        restaurant.setIsApproved(true);
        log.info("Restaurant approved: {}", id);
        return restaurantRepository.save(restaurant);
    }

    public Restaurant toggleOpen(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RestaurantNotFoundException(RESTAURANT_NOT_FOUND + id));

        if (!restaurant.getIsApproved()) {
            throw new RestaurantNotApprovedException("Cannot open restaurant that is not approved");
        }

        restaurant.setIsOpen(!restaurant.getIsOpen());
        log.info("Restaurant {} is now {}", id, restaurant.getIsOpen() ? "OPEN" : "CLOSED");
        return restaurantRepository.save(restaurant);
    }

    public Restaurant toggleActive(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RestaurantNotFoundException(RESTAURANT_NOT_FOUND + id));
        restaurant.setIsActive(!restaurant.getIsActive());
        return restaurantRepository.save(restaurant);
    }

    public Restaurant updateRating(Long restaurantId, Double newAvgRating, Integer newReviewCount) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RestaurantNotFoundException(RESTAURANT_NOT_FOUND + restaurantId));
        restaurant.setRating(newAvgRating);
        restaurant.setReviewCount(newReviewCount);
        log.info("Updated rating for restaurant {}: {} ({} reviews)", restaurantId, newAvgRating, newReviewCount);
        return restaurantRepository.save(restaurant);
    }

    public void deleteRestaurant(Long id) {
        if (!restaurantRepository.existsById(id)) {
            throw new RestaurantNotFoundException(RESTAURANT_NOT_FOUND + id);
        }
        restaurantRepository.deleteById(id);
        log.info("Restaurant deleted: {}", id);
    }
}
