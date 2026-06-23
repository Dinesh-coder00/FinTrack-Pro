package com.fintrack.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/** Request body for creating a savings goal. */
public record SavingsGoalRequest(

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    String title,

    @NotNull
    @DecimalMin(value = "1", message = "Target amount must be at least 1")
    BigDecimal targetAmount,

    @DecimalMin(value = "0", message = "Saved amount cannot be negative")
    BigDecimal savedAmount,

    LocalDate deadline
) {}
