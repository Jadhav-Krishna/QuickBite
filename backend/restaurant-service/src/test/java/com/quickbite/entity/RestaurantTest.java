package com.quickbite.entity;

import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class RestaurantTest {

    @Test
    void allArgsConstructor_createsRestaurant() {
        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);
        Point location = gf.createPoint(new Coordinate(77.5, 23.2));
        LocalDateTime now = LocalDateTime.now();
        Set<String> cuisines = Set.of("Indian", "Chinese");

        Restaurant restaurant = new Restaurant(
                1L, 100L, "Test Restaurant", "Indian", "Description",
                "Address", "City", "State", "462001", location,
                4.5, 100, "9999999999", "test@mail.com", "GST123456789", "FSSAI12345678",
                50.0, 10.0, 100.0, 30, 60, 45,
                true, true, true, "image-url",
                "09:00", "22:00", cuisines, now, now
        );

        assertEquals(1L, restaurant.getId());
        assertEquals(100L, restaurant.getOwnerId());
        assertEquals("Test Restaurant", restaurant.getName());
        assertEquals("Indian", restaurant.getCuisineType());
        assertEquals(4.5, restaurant.getRating());
        assertEquals(100, restaurant.getReviewCount());
        assertTrue(restaurant.getIsActive());
        assertTrue(restaurant.getIsOpen());
        assertTrue(restaurant.getIsApproved());
    }

    @Test
    void prePersist_setsTimestamps() {
        Restaurant restaurant = new Restaurant();
        restaurant.onCreate();

        assertNotNull(restaurant.getCreatedAt());
        assertNotNull(restaurant.getUpdatedAt());
    }

    @Test
    void preUpdate_updatesTimestamp() {
        Restaurant restaurant = new Restaurant();
        restaurant.onCreate();
        LocalDateTime createdAt = restaurant.getCreatedAt();

        restaurant.onUpdate();

        assertNotNull(restaurant.getUpdatedAt());
        assertTrue(restaurant.getUpdatedAt().isAfter(createdAt) || 
                   restaurant.getUpdatedAt().isEqual(createdAt));
    }
}