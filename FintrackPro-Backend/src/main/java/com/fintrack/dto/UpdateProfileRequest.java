package com.fintrack.dto;

import jakarta.validation.constraints.*;

/** Profile update — all fields optional; only non-null values are applied. */
public record UpdateProfileRequest(

    @Size(min = 2, max = 100)
    String name,

    @Size(max = 10)
    String currency,

    Boolean darkMode,
    String  avatarUrl
) {}
