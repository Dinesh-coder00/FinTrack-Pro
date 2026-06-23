package com.fintrack.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

/** Request body for creating or updating a monthly budget. */
public record BudgetRequest(

    @NotNull @Min(1) @Max(12)
    Integer month,

    @NotNull @Min(2000)
    Integer year,

    @NotNull
    @DecimalMin(value = "1", message = "Budget limit must be at least 1")
    BigDecimal totalLimit,

    @Min(1) @Max(100)
    Integer warnPct
) {}
