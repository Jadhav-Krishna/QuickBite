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
import java.util.List;
import java.util.Set;

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
        restaurant.setRating(4.5);
        restaurant.setReviewCount(12);
        restaurant.setDeliveryFee(20.0);
        restaurant.setDeliveryRadius(8.0);
        restaurant.setMinOrderAmount(100.0);
        restaurant.setMinDeliveryTime(25);
        restaurant.setMaxDeliveryTime(45);
        restaurant.setEstimatedDeliveryMin(35);
        restaurant.setIsActive(true);
        restaurant.setIsOpen(true);
        restaurant.setIsApproved(false);
        restaurant.setOpeningTime("09:00");
        restaurant.setClosingTime("22:00");
        restaurant.setCuisines(Set.of("Indian", "Snacks"));
    }

    @Test
    void createRestaurant_usesDefaultsWhenOptionalValuesMissing() {
        RestaurantDTO dto = RestaurantDTO.builder()
                .ownerId(1L)
                .name("Minimal")
                .build();
        Restaurant minimal = new Restaurant();
        minimal.setId(2L);
        minimal.setOwnerId(1L);
        minimal.setName("Minimal");
        minimal.setIsActive(false);
        minimal.setIsOpen(false);
        minimal.setIsApproved(false);
        when(restaurantService.createRestaurant(any())).thenReturn(minimal);

        ResponseEntity<RestaurantDTO> response = controller.createRestaurant(dto);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(restaurantService).createRestaurant(argThat(entity ->
                entity.getRating().equals(0.0)
                        && entity.getReviewCount().equals(0)
                        && entity.getDeliveryRadius().equals(10.0)
                        && entity.getEstimatedDeliveryMin().equals(45)
        ));
    }

    @Test
    void createRestaurant_mapsProvidedOptionalValues() {
        when(restaurantService.createRestaurant(any())).thenReturn(restaurant);

        ResponseEntity<RestaurantDTO> response = controller.createRestaurant(dto());

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(restaurantService).createRestaurant(argThat(entity ->
                entity.getLocation() != null
                        && entity.getRating().equals(4.5)
                        && entity.getReviewCount().equals(12)
                        && entity.getDeliveryFee().equals(20.0)
                        && entity.getDeliveryRadius().equals(8.0)
                        && entity.getMinOrderAmount().equals(100.0)
                        && entity.getMinDeliveryTime().equals(25)
                        && entity.getMaxDeliveryTime().equals(45)
                        && entity.getEstimatedDeliveryMin().equals(35)
                        && Boolean.TRUE.equals(entity.getIsActive())
                        && Boolean.TRUE.equals(entity.getIsOpen())
                        && Boolean.TRUE.equals(entity.getIsApproved())
        ));
    }

    @Test
    void createRestaurant_mapsExplicitFalseFlagsAndPartialLocation() {
        RestaurantDTO dto = RestaurantDTO.builder()
                .ownerId(1L)
                .name("Partial")
                .latitude(23.2)
                .isActive(false)
                .isOpen(false)
                .isApproved(false)
                .build();
        when(restaurantService.createRestaurant(any())).thenReturn(restaurant);

        ResponseEntity<RestaurantDTO> response = controller.createRestaurant(dto);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(restaurantService).createRestaurant(argThat(entity ->
                entity.getLocation() == null
                        && Boolean.FALSE.equals(entity.getIsActive())
                        && Boolean.FALSE.equals(entity.getIsOpen())
                        && Boolean.FALSE.equals(entity.getIsApproved())
        ));
    }

    @Test
    void getRestaurant_success() {
        when(restaurantService.getRestaurantById(1L)).thenReturn(restaurant);

        ResponseEntity<RestaurantDTO> response = controller.getRestaurant(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void listEndpoints_returnMappedRestaurants() {
        when(restaurantService.getAllRestaurants()).thenReturn(List.of(restaurant));
        when(restaurantService.getActiveRestaurants()).thenReturn(List.of(restaurant));
        when(restaurantService.getRestaurantsByOwner(1L)).thenReturn(List.of(restaurant));
        when(restaurantService.searchRestaurants("test")).thenReturn(List.of(restaurant));
        when(restaurantService.getNearbyRestaurants(23.2, 77.5, 5.0)).thenReturn(List.of(restaurant));
        when(restaurantService.getNearbyRestaurantsByCuisine(23.2, 77.5, 5.0, "Indian")).thenReturn(List.of(restaurant));
        when(restaurantService.getRestaurantsByCity("Bhopal")).thenReturn(List.of(restaurant));
        when(restaurantService.getRestaurantsByCuisine("Indian")).thenReturn(List.of(restaurant));

        assertEquals(1, controller.getAllRestaurants().getBody().size());
        assertEquals(1, controller.getActiveRestaurants().getBody().size());
        assertEquals(1, controller.getRestaurantsByOwner(1L).getBody().size());
        assertEquals(1, controller.searchRestaurants("test").getBody().size());
        assertEquals(1, controller.getNearbyRestaurants(23.2, 77.5, 5.0).getBody().size());
        assertEquals(1, controller.getNearbyRestaurantsByCuisine(23.2, 77.5, "Indian", 5.0).getBody().size());
        assertEquals(1, controller.getRestaurantsByCity("Bhopal").getBody().size());
        assertEquals(1, controller.getRestaurantsByCuisine("Indian").getBody().size());
    }

    @Test
    void deleteRestaurant_success() {
        ResponseEntity<Void> response = controller.deleteRestaurant(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(restaurantService).deleteRestaurant(1L);
    }

    @Test
    void stateEndpoints_returnUpdatedRestaurant() {
        when(restaurantService.approveRestaurant(1L)).thenReturn(restaurant);
        when(restaurantService.toggleOpen(1L)).thenReturn(restaurant);
        when(restaurantService.toggleActive(1L)).thenReturn(restaurant);
        when(restaurantService.updateRating(1L, 4.8, 20)).thenReturn(restaurant);

        assertEquals(HttpStatus.OK, controller.approveRestaurant(1L).getStatusCode());
        assertEquals(HttpStatus.OK, controller.toggleOpen(1L).getStatusCode());
        assertEquals(HttpStatus.OK, controller.toggleActive(1L).getStatusCode());
        assertEquals(HttpStatus.OK, controller.updateRating(1L, 4.8, 20).getStatusCode());
    }

    @Test
    void uploadRestaurantImage_successDeletesOldImageAndUpdatesRestaurant() throws Exception {
        when(restaurantService.getRestaurantById(1L)).thenReturn(restaurant);
        when(cloudinaryService.uploadImage(file, "restaurants")).thenReturn("new-url");

        ResponseEntity<String> response = controller.uploadRestaurantImage(1L, file);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("new-url", response.getBody());
        verify(cloudinaryService).deleteImage("old-url");
        verify(restaurantService).updateRestaurant(eq(1L), argThat(update -> "new-url".equals(update.getImageUrl())));
    }

    @Test
    void uploadRestaurantImage_successWhenNoOldImage() throws Exception {
        restaurant.setImageUrl("");
        when(restaurantService.getRestaurantById(1L)).thenReturn(restaurant);
        when(cloudinaryService.uploadImage(file, "restaurants")).thenReturn("new-url");

        ResponseEntity<String> response = controller.uploadRestaurantImage(1L, file);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(cloudinaryService, never()).deleteImage(anyString());
    }

    @Test
    void uploadRestaurantImage_successWhenOldImageIsNull() throws Exception {
        restaurant.setImageUrl(null);
        when(restaurantService.getRestaurantById(1L)).thenReturn(restaurant);
        when(cloudinaryService.uploadImage(file, "restaurants")).thenReturn("new-url");

        ResponseEntity<String> response = controller.uploadRestaurantImage(1L, file);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(cloudinaryService, never()).deleteImage(anyString());
    }

    @Test
    void deleteRestaurantImage_successDeletesExistingImage() throws Exception {
        when(restaurantService.getRestaurantById(1L)).thenReturn(restaurant);

        ResponseEntity<Void> response = controller.deleteRestaurantImage(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(cloudinaryService).deleteImage("old-url");
        verify(restaurantService).updateRestaurant(eq(1L), argThat(update -> update.getImageUrl() == null));
    }

    @Test
    void deleteRestaurantImage_successWhenNoImage() throws Exception {
        restaurant.setImageUrl(null);
        when(restaurantService.getRestaurantById(1L)).thenReturn(restaurant);

        ResponseEntity<Void> response = controller.deleteRestaurantImage(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(cloudinaryService, never()).deleteImage(anyString());
    }

    @Test
    void deleteRestaurantImage_successWhenImageUrlIsEmpty() throws Exception {
        restaurant.setImageUrl("");
        when(restaurantService.getRestaurantById(1L)).thenReturn(restaurant);

        ResponseEntity<Void> response = controller.deleteRestaurantImage(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(cloudinaryService, never()).deleteImage(anyString());
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

    private RestaurantDTO dto() {
        return RestaurantDTO.builder()
                .id(1L)
                .ownerId(1L)
                .name("Test")
                .cuisineType("Indian")
                .description("Nice food")
                .address("Address")
                .city("Bhopal")
                .state("MP")
                .pincode("462001")
                .latitude(23.2)
                .longitude(77.5)
                .rating(4.5)
                .reviewCount(12)
                .phoneNumber("9999999999")
                .email("test@mail.com")
                .deliveryFee(20.0)
                .deliveryRadius(8.0)
                .minOrderAmount(100.0)
                .minDeliveryTime(25)
                .maxDeliveryTime(45)
                .estimatedDeliveryMin(35)
                .isActive(true)
                .isOpen(true)
                .isApproved(true)
                .imageUrl("old-url")
                .openingTime("09:00")
                .closingTime("22:00")
                .cuisines(Set.of("Indian", "Snacks"))
                .build();
    }
}
