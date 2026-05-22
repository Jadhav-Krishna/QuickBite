package com.quickbite.exception;

public class InvalidRestaurantDataException extends RuntimeException {
    public InvalidRestaurantDataException(String message) {
        super(message);
    }
}
