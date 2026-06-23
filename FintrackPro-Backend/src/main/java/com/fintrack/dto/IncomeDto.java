package com.fintrack.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Income record returned to the client. */
public record IncomeDto(
    Long          id,
    String        title,
    BigDecimal    amount,
    String        category,
    LocalDate     date,
    String        description,
    LocalDateTime createdAt
) {}
