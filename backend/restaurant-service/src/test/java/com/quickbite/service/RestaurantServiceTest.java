package com.quickbite.service;

import com.quickbite.entity.Restaurant;
import com.quickbite.repository.RestaurantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RestaurantServiceTest {

    @Mock
    private RestaurantRepository restaurantRepository;

    @InjectMocks
    private RestaurantService restaurantService;

    private Restaurant testRestaurant;

    @BeforeEach
    void setUp() {
        testRestaurant = new Restaurant();
        testRestaurant.setId(1L);
        testRestaurant.setName("Test Restaurant");
        testRestaurant.setOwnerId(1L);
        testRestaurant.setIsActive(true);
    }

    @Test
    void getRestaurantById_Success() {
        when(restaurantRepository.findById(anyLong())).thenReturn(Optional.of(testRestaurant));

        Restaurant result = restaurantService.getRestaurantById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(restaurantRepository).findById(1L);
    }

    @Test
    void getAllRestaurants_Success() {
        when(restaurantRepository.findAll()).thenReturn(Arrays.asList(testRestaurant));

        List<Restaurant> results = restaurantService.getAllRestaurants();

        assertNotNull(results);
        assertEquals(1, results.size());
    }

    @Test
    void getRestaurantsByOwner_Success() {
        when(restaurantRepository.findByOwnerId(anyLong())).thenReturn(Arrays.asList(testRestaurant));

        List<Restaurant> results = restaurantService.getRestaurantsByOwner(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
    }

    @Test
    void updateRestaurant_Success() {
        when(restaurantRepository.findById(anyLong())).thenReturn(Optional.of(testRestaurant));
        when(restaurantRepository.save(any(Restaurant.class))).thenReturn(testRestaurant);

        Restaurant updateRestaurant = new Restaurant();
        updateRestaurant.setName("Updated Restaurant");

        Restaurant result = restaurantService.updateRestaurant(1L, updateRestaurant);

        assertNotNull(result);
        verify(restaurantRepository).save(any(Restaurant.class));
    }

    @Test
    void deleteRestaurant_Success() {
        when(restaurantRepository.existsById(anyLong())).thenReturn(true);
        doNothing().when(restaurantRepository).deleteById(anyLong());

        restaurantService.deleteRestaurant(1L);

        verify(restaurantRepository).deleteById(1L);
    }
}
