package com.quickbite.controller;

import com.quickbite.dto.RestaurantDTO;
import com.quickbite.entity.Restaurant;
import com.quickbite.service.CloudinaryService;
import com.quickbite.service.RestaurantService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RestaurantControllerTest {

    @Mock private RestaurantService restaurantService;
    @Mock private CloudinaryService cloudinaryService;
    @Mock private MultipartFile file;

    @InjectMocks private RestaurantController controller;

    private Restaurant restaurant;
    private GeometryFactory gf;

    @BeforeEach
    void setup() {
        gf = new GeometryFactory(new PrecisionModel(), 4326);
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
        restaurant.setImageUrl("old-url");
    }

    @Test
    void uploadRestaurantImage_ioException() throws Exception {
        when(restaurantService.getRestaurantById(1L)).thenReturn(restaurant);
        when(cloudinaryService.uploadImage(file, "restaurants"))
                .thenThrow(new IOException("Upload failed"));

        ResponseEntity<String> response = controller.uploadRestaurantImage(1L, file);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().contains("Failed to upload image"));
    }

    @Test
    void uploadRestaurantImage_runtimeException() throws Exception {
        when(restaurantService.getRestaurantById(1L))
                .thenThrow(new RuntimeException("Service error"));

        ResponseEntity<String> response = controller.uploadRestaurantImage(1L, file);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().contains("Failed to upload image"));
    }

    @Test
    void deleteRestaurantImage_exception() {
        when(restaurantService.getRestaurantById(1L))
                .thenThrow(new RuntimeException("Service error"));

        ResponseEntity<Void> response = controller.deleteRestaurantImage(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }
}
