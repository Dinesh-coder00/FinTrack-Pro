package com.fintrack.dto;

import jakarta.validation.constraints.*;

/** Registration request payload. */
public record RegisterRequest(

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be 2–100 characters")
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "A valid email address is required")
    String email,

    @NotBlank(message = "Password is required")
    @Pattern(
        regexp  = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
        message = "Password must be at least 8 characters and include uppercase, lowercase, and a digit"
    )
    String password,

    @Size(max = 10)
    String currency
) {}
