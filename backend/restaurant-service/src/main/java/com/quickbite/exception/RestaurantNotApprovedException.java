package com.quickbite.exception;

public class RestaurantNotApprovedException extends RuntimeException {
    public RestaurantNotApprovedException(String message) {
        super(message);
    }
}
