package com.fintrack.exception;

import lombok.Getter;
import org.springframework.http.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Centralised exception handler.
 *
 * Every exception is mapped to a consistent {@link ErrorResponse} JSON body so the
 * frontend can always rely on: { timestamp, status, error, message, fieldErrors? }
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── Error response payload ────────────────────────────────────────────────

    @Getter
    public static class ErrorResponse {
        private final LocalDateTime          timestamp = LocalDateTime.now();
        private final int                    status;
        private final String                 error;
        private final String                 message;
        private final Map<String, String>    fieldErrors;

        public ErrorResponse(int status, String error, String message) {
            this(status, error, message, null);
        }

        public ErrorResponse(int status, String error, String message,
                             Map<String, String> fieldErrors) {
            this.status      = status;
            this.error       = error;
            this.message     = message;
            this.fieldErrors = fieldErrors;
        }
    }

    // ── Handlers ─────────────────────────────────────────────────────────────

    /** 404 – Resource not found */
    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, "Not Found", ex.getMessage()));
    }

    /** 409 – Business rule violation */
    @ExceptionHandler(BusinessException.class)
    ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(409, "Conflict", ex.getMessage()));
    }

    /** 403 – Forbidden (wrong user) */
    @ExceptionHandler(ForbiddenException.class)
    ResponseEntity<ErrorResponse> handleForbidden(ForbiddenException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(403, "Forbidden", ex.getMessage()));
    }

    /** 401 – Bad credentials on login */
    @ExceptionHandler(BadCredentialsException.class)
    ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(401, "Unauthorized", "Invalid email or password"));
    }

    /**
     * 400 – Bean-validation failures (@Valid / @Validated).
     * Returns a fieldErrors map so the UI can highlight individual fields.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, "Validation Failed",
                        "One or more fields are invalid", fieldErrors));
    }

    /** 400 – Malformed JSON or type mismatch */
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    ResponseEntity<ErrorResponse> handleBadRequest(Exception ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, "Bad Request", "Malformed request body"));
    }

    /** 500 – Catch-all for unexpected errors */
    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        // Log the full stack trace internally
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(500, "Internal Server Error",
                        "An unexpected error occurred. Please try again."));
    }
}
