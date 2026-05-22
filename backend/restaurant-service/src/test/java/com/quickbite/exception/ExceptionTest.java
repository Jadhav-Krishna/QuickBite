package com.quickbite.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ExceptionTest {

    @Test
    void invalidRestaurantDataException_createsWithMessage() {
        InvalidRestaurantDataException exception = 
                new InvalidRestaurantDataException("Invalid data");

        assertEquals("Invalid data", exception.getMessage());
        assertInstanceOf(RuntimeException.class, exception);
    }

    @Test
    void restaurantNotApprovedException_createsWithMessage() {
        RestaurantNotApprovedException exception = 
                new RestaurantNotApprovedException("Not approved");

        assertEquals("Not approved", exception.getMessage());
        assertInstanceOf(RuntimeException.class, exception);
    }

    @Test
    void restaurantNotFoundException_createsWithMessage() {
        RestaurantNotFoundException exception = 
                new RestaurantNotFoundException("Not found");

        assertEquals("Not found", exception.getMessage());
        assertInstanceOf(RuntimeException.class, exception);
    }
}
