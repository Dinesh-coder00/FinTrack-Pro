package com.fintrack.dto;

import java.time.LocalDateTime;

/** Public user profile — password is never included. */
public record UserDto(
    Long          id,
    String        name,
    String        email,
    String        avatarUrl,
    String        currency,
    Boolean       darkMode,
    LocalDateTime createdAt
) {}
