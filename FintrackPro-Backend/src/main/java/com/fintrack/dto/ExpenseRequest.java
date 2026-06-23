package com.fintrack.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/** Request body for creating or updating an expense record. */
public record ExpenseRequest(

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    String title,

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    BigDecimal amount,

    @NotBlank(message = "Category is required")
    String category,

    @NotNull(message = "Date is required")
    LocalDate date,

    @Size(max = 500)
    String description
) {}
