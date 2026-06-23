package com.fintrack.exception;

/**
 * Thrown when a business rule is violated (HTTP 409 Conflict).
 * e.g. duplicate email, duplicate budget for same month/year.
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
