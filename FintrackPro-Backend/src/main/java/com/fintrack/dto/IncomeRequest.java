package com.fintrack.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/** Request body for creating or updating an income record. */
public record IncomeRequest(

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    String title,

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    BigDecimal amount,

    @NotBlank(message = "Category is required")
    @Size(max = 100)
    String category,

    @NotNull(message = "Date is required")
    LocalDate date,

    @Size(max = 500)
    String description
) {}
