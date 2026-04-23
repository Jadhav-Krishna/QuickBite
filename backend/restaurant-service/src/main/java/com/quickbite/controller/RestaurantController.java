package com.quickbite.controller;

import com.quickbite.dto.RestaurantDTO;
import com.quickbite.entity.Restaurant;
import com.quickbite.service.RestaurantService;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/restaurants")
@Slf4j
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    private static final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @PostMapping
    public ResponseEntity<RestaurantDTO> createRestaurant(@RequestBody RestaurantDTO restaurantDTO) {
        Restaurant restaurant = mapToEntity(restaurantDTO);
        Restaurant created = restaurantService.createRestaurant(restaurant);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToDTO(created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantDTO> getRestaurant(@PathVariable("id") Long id) {
        Restaurant restaurant = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(mapToDTO(restaurant));
    }

    @GetMapping
    public ResponseEntity<List<RestaurantDTO>> getAllRestaurants() {
        List<RestaurantDTO> restaurants = restaurantService.getAllRestaurants().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/active")
    public ResponseEntity<List<RestaurantDTO>> getActiveRestaurants() {
        List<RestaurantDTO> restaurants = restaurantService.getActiveRestaurants().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<RestaurantDTO>> getRestaurantsByOwner(@PathVariable("ownerId") Long ownerId) {
        List<RestaurantDTO> restaurants = restaurantService.getRestaurantsByOwner(ownerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/search")
    public ResponseEntity<List<RestaurantDTO>> searchRestaurants(@RequestParam("keyword") String keyword) {
        List<RestaurantDTO> restaurants = restaurantService.searchRestaurants(keyword).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<RestaurantDTO>> getNearbyRestaurants(
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam(name = "radiusKm", defaultValue = "10.0") Double radiusKm) {
        List<RestaurantDTO> restaurants = restaurantService.getNearbyRestaurants(latitude, longitude, radiusKm).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/nearby/cuisine")
    public ResponseEntity<List<RestaurantDTO>> getNearbyRestaurantsByCuisine(
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam("cuisineType") String cuisineType,
            @RequestParam(name = "radiusKm", defaultValue = "10.0") Double radiusKm) {
        List<RestaurantDTO> restaurants = restaurantService.getNearbyRestaurantsByCuisine(
                latitude, longitude, radiusKm, cuisineType).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<RestaurantDTO>> getRestaurantsByCity(@PathVariable("city") String city) {
        List<RestaurantDTO> restaurants = restaurantService.getRestaurantsByCity(city).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/cuisine/{cuisineType}")
    public ResponseEntity<List<RestaurantDTO>> getRestaurantsByCuisine(@PathVariable("cuisineType") String cuisineType) {
        List<RestaurantDTO> restaurants = restaurantService.getRestaurantsByCuisine(cuisineType).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(restaurants);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantDTO> updateRestaurant(
            @PathVariable("id") Long id,
            @RequestBody RestaurantDTO restaurantDTO) {
        Restaurant restaurant = mapToEntityForUpdate(restaurantDTO);
        Restaurant updated = restaurantService.updateRestaurant(id, restaurant);
        return ResponseEntity.ok(mapToDTO(updated));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<RestaurantDTO> approveRestaurant(@PathVariable("id") Long id) {
        log.info("Approve restaurant request for id: {}", id);
        Restaurant approved = restaurantService.approveRestaurant(id);
        return ResponseEntity.ok(mapToDTO(approved));
    }

    @PutMapping("/{id}/toggle-open")
    public ResponseEntity<RestaurantDTO> toggleOpen(@PathVariable("id") Long id) {
        log.info("Toggle open request for restaurant id: {}", id);
        Restaurant toggled = restaurantService.toggleOpen(id);
        return ResponseEntity.ok(mapToDTO(toggled));
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<RestaurantDTO> toggleActive(@PathVariable("id") Long id) {
        log.info("Toggle active request for restaurant id: {}", id);
        Restaurant toggled = restaurantService.toggleActive(id);
        return ResponseEntity.ok(mapToDTO(toggled));
    }

    @PutMapping("/{id}/rating")
    public ResponseEntity<RestaurantDTO> updateRating(
            @PathVariable("id") Long id,
            @RequestParam("newAvgRating") Double newAvgRating,
            @RequestParam("newReviewCount") Integer newReviewCount) {
        log.info("Update rating request for restaurant id: {}", id);
        Restaurant updated = restaurantService.updateRating(id, newAvgRating, newReviewCount);
        return ResponseEntity.ok(mapToDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable("id") Long id) {
        restaurantService.deleteRestaurant(id);
        return ResponseEntity.noContent().build();
    }

    // Helper mapping methods since mapstruct wasn't configured
    private Restaurant mapToEntity(RestaurantDTO dto) {
        Restaurant entity = new Restaurant();
        entity.setId(dto.getId());
        entity.setOwnerId(dto.getOwnerId());
        entity.setName(dto.getName());
        entity.setCuisineType(dto.getCuisineType());
        entity.setDescription(dto.getDescription());
        entity.setAddress(dto.getAddress());
        entity.setCity(dto.getCity());
        entity.setState(dto.getState());
        entity.setPincode(dto.getPincode());
        
        if (dto.getLatitude() != null && dto.getLongitude() != null) {
            entity.setLocation(geometryFactory.createPoint(new Coordinate(dto.getLongitude(), dto.getLatitude())));
        }
        
        entity.setRating(dto.getRating() != null ? dto.getRating() : 0.0);
        entity.setReviewCount(dto.getReviewCount() != null ? dto.getReviewCount() : 0);
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setEmail(dto.getEmail());
        entity.setDeliveryFee(dto.getDeliveryFee() != null ? dto.getDeliveryFee() : 0.0);
        entity.setDeliveryRadius(dto.getDeliveryRadius() != null ? dto.getDeliveryRadius() : 10.0);
        entity.setMinOrderAmount(dto.getMinOrderAmount() != null ? dto.getMinOrderAmount() : 0.0);
        entity.setMinDeliveryTime(dto.getMinDeliveryTime() != null ? dto.getMinDeliveryTime() : 30);
        entity.setMaxDeliveryTime(dto.getMaxDeliveryTime() != null ? dto.getMaxDeliveryTime() : 60);
        entity.setEstimatedDeliveryMin(dto.getEstimatedDeliveryMin() != null ? dto.getEstimatedDeliveryMin() : 45);
        entity.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        entity.setIsOpen(dto.getIsOpen() != null ? dto.getIsOpen() : false);
        entity.setIsApproved(dto.getIsApproved() != null ? dto.getIsApproved() : false);
        entity.setImageUrl(dto.getImageUrl());
        entity.setOpeningTime(dto.getOpeningTime());
        entity.setClosingTime(dto.getClosingTime());
        entity.setCuisines(dto.getCuisines());
        return entity;
    }

    private Restaurant mapToEntityForUpdate(RestaurantDTO dto) {
        Restaurant entity = new Restaurant();
        entity.setId(dto.getId());
        entity.setOwnerId(dto.getOwnerId());
        entity.setName(dto.getName());
        entity.setCuisineType(dto.getCuisineType());
        entity.setDescription(dto.getDescription());
        entity.setAddress(dto.getAddress());
        entity.setCity(dto.getCity());
        entity.setState(dto.getState());
        entity.setPincode(dto.getPincode());

        if (dto.getLatitude() != null && dto.getLongitude() != null) {
            entity.setLocation(geometryFactory.createPoint(new Coordinate(dto.getLongitude(), dto.getLatitude())));
        }

        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setEmail(dto.getEmail());
        entity.setDeliveryFee(dto.getDeliveryFee());
        entity.setDeliveryRadius(dto.getDeliveryRadius());
        entity.setMinOrderAmount(dto.getMinOrderAmount());
        entity.setMinDeliveryTime(dto.getMinDeliveryTime());
        entity.setMaxDeliveryTime(dto.getMaxDeliveryTime());
        entity.setEstimatedDeliveryMin(dto.getEstimatedDeliveryMin());
        entity.setIsActive(dto.getIsActive());
        entity.setIsOpen(dto.getIsOpen());
        entity.setImageUrl(dto.getImageUrl());
        entity.setOpeningTime(dto.getOpeningTime());
        entity.setClosingTime(dto.getClosingTime());
        entity.setCuisines(dto.getCuisines());
        return entity;
    }

    private RestaurantDTO mapToDTO(Restaurant entity) {
        Double lat = null;
        Double lng = null;
        if (entity.getLocation() != null) {
            lat = entity.getLocation().getY();
            lng = entity.getLocation().getX();
        }

        return RestaurantDTO.builder()
                .id(entity.getId())
                .ownerId(entity.getOwnerId())
                .name(entity.getName())
                .cuisineType(entity.getCuisineType())
                .description(entity.getDescription())
                .address(entity.getAddress())
                .city(entity.getCity())
                .state(entity.getState())
                .pincode(entity.getPincode())
                .latitude(lat)
                .longitude(lng)
                .rating(entity.getRating())
                .reviewCount(entity.getReviewCount())
                .phoneNumber(entity.getPhoneNumber())
                .email(entity.getEmail())
                .deliveryFee(entity.getDeliveryFee())
                .deliveryRadius(entity.getDeliveryRadius())
                .minOrderAmount(entity.getMinOrderAmount())
                .minDeliveryTime(entity.getMinDeliveryTime())
                .maxDeliveryTime(entity.getMaxDeliveryTime())
                .estimatedDeliveryMin(entity.getEstimatedDeliveryMin())
                .isActive(entity.getIsActive())
                .isOpen(entity.getIsOpen())
                .isApproved(entity.getIsApproved())
                .imageUrl(entity.getImageUrl())
                .openingTime(entity.getOpeningTime())
                .closingTime(entity.getClosingTime())
                .cuisines(entity.getCuisines())
                .build();
    }
}
