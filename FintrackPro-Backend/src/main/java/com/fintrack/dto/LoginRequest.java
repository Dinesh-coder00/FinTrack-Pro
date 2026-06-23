package com.fintrack.dto;

import jakarta.validation.constraints.*;

/** Login request payload. */
public record LoginRequest(

    @NotBlank(message = "Email is required")
    @Email(message = "A valid email is required")
    String email,

    @NotBlank(message = "Password is required")
    String password
) {}
