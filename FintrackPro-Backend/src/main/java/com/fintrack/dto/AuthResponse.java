package com.fintrack.dto;

/** JWT token + user summary returned after successful authentication. */
public record AuthResponse(
    String  token,
    String  type,      // always "Bearer"
    Long    userId,
    String  name,
    String  email,
    String  currency,
    Boolean darkMode
) {}
