package com.fintrack.dto;

import java.math.BigDecimal;

/** Budget record enriched with computed spending metrics. */
public record BudgetDto(
    Long       id,
    Integer    month,
    Integer    year,
    BigDecimal totalLimit,
    Integer    warnPct,
    BigDecimal spent,       // computed from expenses in that month
    BigDecimal remaining,   // totalLimit - spent
    Double     pctUsed,     // (spent / totalLimit) * 100
    Boolean    overBudget   // spent >= totalLimit
) {}
