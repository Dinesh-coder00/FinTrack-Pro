package com.fintrack.dto;

import java.math.BigDecimal;

/** Income and expense totals for one calendar month (bar / line charts). */
public record MonthlyTrendDto(
    String     month,    // "YYYY-MM"
    BigDecimal income,
    BigDecimal expense
) {}
