package com.fintrack.dto;

import lombok.Getter;

/**
 * Generic JSON envelope for every API response.
 *
 * <pre>
 * {
 *   "success": true,
 *   "message": "Success",
 *   "data": { ... }
 * }
 * </pre>
 *
 * @param <T> payload type
 */
@Getter
public class ApiResponse<T> {

    private final boolean success;
    private final String  message;
    private final T       data;

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data    = data;
    }

    /** 200 OK with data. */
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "Success", data);
    }

    /** 200 OK with custom message and data. */
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    /** Error response (no data). */
    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
