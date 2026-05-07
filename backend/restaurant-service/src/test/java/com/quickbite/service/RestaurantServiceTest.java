package com.quickbite.service;

import com.quickbite.exception.InvalidRestaurantDataException;
import com.quickbite.exception.RestaurantNotApprovedException;
import com.quickbite.exception.RestaurantNotFoundException;
import com.quickbite.entity.Restaurant;
import com.quickbite.repository.RestaurantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.*;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RestaurantServiceTest {

    @Mock private RestaurantRepository restaurantRepository;

    @InjectMocks private RestaurantService restaurantService;

    private Restaurant restaurant;

    @BeforeEach
    void setup() {
        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);
        Point location = gf.createPoint(new Coordinate(77.5, 23.2));

        restaurant = new Restaurant();
        restaurant.setId(1L);
        restaurant.setName("Test");
        restaurant.setOwnerId(1L);
        restaurant.setCuisineType("Indian");
        restaurant.setAddress("Address");
        restaurant.setCity("Bhopal");
        restaurant.setState("MP");
        restaurant.setPincode("462001");
        restaurant.setPhoneNumber("9999999999");
        restaurant.setEmail("test@mail.com");
        restaurant.setLocation(location);
        restaurant.setIsApproved(false);
        restaurant.setIsOpen(false);
        restaurant.setIsActive(true);
    }

    // ================= CREATE =================

    @Test
    void createRestaurant_success() {
        when(restaurantRepository.save(any())).thenReturn(restaurant);

        Restaurant result = restaurantService.createRestaurant(restaurant);

        assertNotNull(result);
        assertTrue(result.getIsActive());
        assertFalse(result.getIsOpen());
        assertFalse(result.getIsApproved());
    }

    @Test
    void createRestaurant_missingName() {
        restaurant.setName(null);

        assertThrows(InvalidRestaurantDataException.class,
                () -> restaurantService.createRestaurant(restaurant));
    }

    @Test
    void createRestaurant_blankName() {
        restaurant.setName("");

        assertThrows(InvalidRestaurantDataException.class,
                () -> restaurantService.createRestaurant(restaurant));
    }

    @Test
    void createRestaurant_missingLocation() {
        restaurant.setLocation(null);

        assertThrows(InvalidRestaurantDataException.class,
                () -> restaurantService.createRestaurant(restaurant));
    }

    @Test
    void createRestaurant_missingCuisineType() {
        restaurant.setCuisineType(null);

        assertThrows(InvalidRestaurantDataException.class,
                () -> restaurantService.createRestaurant(restaurant));
    }

    @Test
    void createRestaurant_missingAddress() {
        restaurant.setAddress(null);

        assertThrows(InvalidRestaurantDataException.class,
                () -> restaurantService.createRestaurant(restaurant));
    }

    @Test
    void createRestaurant_missingCity() {
        restaurant.setCity(null);

        assertThrows(InvalidRestaurantDataException.class,
                () -> restaurantService.createRestaurant(restaurant));
    }

    @Test
    void createRestaurant_missingState() {
        restaurant.setState(null);

        assertThrows(InvalidRestaurantDataException.class,
                () -> restaurantService.createRestaurant(restaurant));
    }

    @Test
    void createRestaurant_missingPincode() {
        restaurant.setPincode(null);

        assertThrows(InvalidRestaurantDataException.class,
                () -> restaurantService.createRestaurant(restaurant));
    }

    @Test
    void createRestaurant_missingPhoneNumber() {
        restaurant.setPhoneNumber(null);

        assertThrows(InvalidRestaurantDataException.class,
                () -> restaurantService.createRestaurant(restaurant));
    }

    @Test
    void createRestaurant_missingEmail() {
        restaurant.setEmail(null);

        assertThrows(InvalidRestaurantDataException.class,
                () -> restaurantService.createRestaurant(restaurant));
    }

    @Test
    void createRestaurant_defaultImageUrl() {
        restaurant.setImageUrl(null);
        when(restaurantRepository.save(any())).thenReturn(restaurant);

        Restaurant result = restaurantService.createRestaurant(restaurant);

        assertNotNull(result.getImageUrl());
    }

    // ================= GET =================

    @Test
    void getById_success() {
        when(restaurantRepository.findById(any()))
                .thenReturn(Optional.of(restaurant));

        assertNotNull(restaurantService.getRestaurantById(1L));
    }

    @Test
    void getById_notFound() {
        when(restaurantRepository.findById(any()))
                .thenReturn(Optional.empty());

        assertThrows(RestaurantNotFoundException.class,
                () -> restaurantService.getRestaurantById(1L));
    }

    @Test
    void getByOwner_success() {
        when(restaurantRepository.findByOwnerId(any()))
                .thenReturn(List.of(restaurant));

        assertEquals(1, restaurantService.getRestaurantsByOwner(1L).size());
    }

    @Test
    void getAllRestaurants_success() {
        when(restaurantRepository.findAll())
                .thenReturn(List.of(restaurant));

        assertEquals(1, restaurantService.getAllRestaurants().size());
    }

    @Test
    void getActiveRestaurants_success() {
        when(restaurantRepository.findByIsActiveAndIsApproved(true, true))
                .thenReturn(List.of(restaurant));

        assertEquals(1, restaurantService.getActiveRestaurants().size());
    }

    @Test
    void getByCity_success() {
        when(restaurantRepository.findByCity(any()))
                .thenReturn(List.of(restaurant));

        assertEquals(1, restaurantService.getRestaurantsByCity("Bhopal").size());
    }

    @Test
    void getByCuisine_success() {
        when(restaurantRepository.findByCuisineType(any()))
                .thenReturn(List.of(restaurant));

        assertEquals(1, restaurantService.getRestaurantsByCuisine("Indian").size());
    }

    // ================= UPDATE =================

    @Test
    void updateRestaurant_success() {
        when(restaurantRepository.findById(any()))
                .thenReturn(Optional.of(restaurant));
        when(restaurantRepository.save(any())).thenReturn(restaurant);

        Restaurant update = new Restaurant();
        update.setName("Updated");

        Restaurant result = restaurantService.updateRestaurant(1L, update);

        assertEquals("Updated", result.getName());
    }

    @Test
    void updateRestaurant_notFound() {
        when(restaurantRepository.findById(1L))
                .thenReturn(Optional.empty());

        Restaurant update = new Restaurant();
        assertThrows(RestaurantNotFoundException.class,
                () -> restaurantService.updateRestaurant(1L, update));
    }

    @Test
    void updateRestaurant_allFields() {
        when(restaurantRepository.findById(any()))
                .thenReturn(Optional.of(restaurant));
        when(restaurantRepository.save(any())).thenReturn(restaurant);

        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);
        Point newLocation = gf.createPoint(new Coordinate(78.0, 24.0));

        Restaurant update = new Restaurant();
        update.setName("New Name");
        update.setCuisineType("Chinese");
        update.setDescription("New Desc");
        update.setAddress("New Address");
        update.setCity("New City");
        update.setState("New State");
        update.setPincode("123456");
        update.setPhoneNumber("1111111111");
        update.setEmail("new@mail.com");
        update.setDeliveryFee(50.0);
        update.setDeliveryRadius(10.0);
        update.setMinOrderAmount(100.0);
        update.setMinDeliveryTime(20);
        update.setMaxDeliveryTime(40);
        update.setImageUrl("new-url");
        update.setEstimatedDeliveryMin(30);
        update.setCuisines(Set.of("Chinese", "Thai"));
        update.setOpeningTime("09:00");
        update.setClosingTime("22:00");
        update.setIsOpen(true);
        update.setIsActive(false);
        update.setLocation(newLocation);

        Restaurant result = restaurantService.updateRestaurant(1L, update);

        assertEquals("New Name", result.getName());
        assertEquals("Chinese", result.getCuisineType());
        assertEquals(newLocation, result.getLocation());
    }

    // ================= APPROVAL =================

    @Test
    void approveRestaurant_success() {
        when(restaurantRepository.findById(any()))
                .thenReturn(Optional.of(restaurant));
        when(restaurantRepository.save(any())).thenReturn(restaurant);

        Restaurant result = restaurantService.approveRestaurant(1L);

        assertTrue(result.getIsApproved());
    }

    @Test
    void approveRestaurant_notFound() {
        when(restaurantRepository.findById(any()))
                .thenReturn(Optional.empty());

        assertThrows(RestaurantNotFoundException.class,
                () -> restaurantService.approveRestaurant(1L));
    }

    // ================= OPEN =================

    @Test
    void toggleOpen_success() {
        restaurant.setIsApproved(true);
        restaurant.setIsOpen(false);

        when(restaurantRepository.findById(any()))
                .thenReturn(Optional.of(restaurant));
        when(restaurantRepository.save(any())).thenReturn(restaurant);

        Restaurant result = restaurantService.toggleOpen(1L);

        assertTrue(result.getIsOpen());
    }

    @Test
    void toggleOpen_notApproved() {
        restaurant.setIsApproved(false);

        when(restaurantRepository.findById(any()))
                .thenReturn(Optional.of(restaurant));

        assertThrows(RestaurantNotApprovedException.class,
                () -> restaurantService.toggleOpen(1L));
    }

    @Test
    void toggleOpen_notFound() {
        when(restaurantRepository.findById(any()))
                .thenReturn(Optional.empty());

        assertThrows(RestaurantNotFoundException.class,
                () -> restaurantService.toggleOpen(1L));
    }

    // ================= ACTIVE =================

    @Test
    void toggleActive_success() {
        restaurant.setIsActive(true);

        when(restaurantRepository.findById(any()))
                .thenReturn(Optional.of(restaurant));
        when(restaurantRepository.save(any())).thenReturn(restaurant);

        Restaurant result = restaurantService.toggleActive(1L);

        assertFalse(result.getIsActive());
    }

    @Test
    void toggleActive_notFound() {
        when(restaurantRepository.findById(any()))
                .thenReturn(Optional.empty());

        assertThrows(RestaurantNotFoundException.class,
                () -> restaurantService.toggleActive(1L));
    }

    // ================= RATING =================

    @Test
    void updateRating_success() {
        when(restaurantRepository.findById(any()))
                .thenReturn(Optional.of(restaurant));
        when(restaurantRepository.save(any())).thenReturn(restaurant);

        Restaurant result = restaurantService.updateRating(1L, 4.5, 100);

        assertEquals(4.5, result.getRating());
        assertEquals(100, result.getReviewCount());
    }

    @Test
    void updateRating_notFound() {
        when(restaurantRepository.findById(any()))
                .thenReturn(Optional.empty());

        assertThrows(RestaurantNotFoundException.class,
                () -> restaurantService.updateRating(1L, 4.5, 100));
    }

    // ================= SEARCH =================

    @Test
    void search_success() {
        when(restaurantRepository.findByNameContainingIgnoreCase(any()))
                .thenReturn(List.of(restaurant));

        assertEquals(1, restaurantService.searchRestaurants("test").size());
    }

    // ================= GEO =================

    @Test
    void nearbyRestaurants_success() {
        when(restaurantRepository.findRestaurantsByLocation(any(), anyDouble(), anyInt()))
                .thenReturn(List.of(restaurant));

        assertEquals(1,
                restaurantService.getNearbyRestaurants(23.2, 77.5, 5).size());
    }

    @Test
    void nearbyByCuisine_success() {
        when(restaurantRepository.findRestaurantsByLocationAndCuisine(any(), anyDouble(), any(), anyInt()))
                .thenReturn(List.of(restaurant));

        assertEquals(1,
                restaurantService.getNearbyRestaurantsByCuisine(23, 77, 5, "Indian").size());
    }

    // ================= DELETE =================

    @Test
    void delete_success() {
        when(restaurantRepository.existsById(any())).thenReturn(true);

        restaurantService.deleteRestaurant(1L);

        verify(restaurantRepository).deleteById(1L);
    }

    @Test
    void delete_notFound() {
        when(restaurantRepository.existsById(any())).thenReturn(false);

        assertThrows(RestaurantNotFoundException.class,
                () -> restaurantService.deleteRestaurant(1L));
    }
}