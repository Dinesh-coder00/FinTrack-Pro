package com.fintrack.exception;

/**
 * Thrown when an authenticated user tries to access a resource
 * that belongs to another user (HTTP 403 Forbidden).
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
