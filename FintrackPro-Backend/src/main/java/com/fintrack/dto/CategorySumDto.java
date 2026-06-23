package com.fintrack.dto;

import java.math.BigDecimal;

/** Aggregated expense total for a single category (used in analytics / pie chart). */
public record CategorySumDto(
    String     category,
    BigDecimal total
) {}
