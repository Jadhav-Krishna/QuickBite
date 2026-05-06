package com.quickbite.exception;

public class EarningsUpdateException extends RuntimeException {
    public EarningsUpdateException(String message) {
        super(message);
    }

    public EarningsUpdateException(String message, Throwable cause) {
        super(message, cause);
    }
}
