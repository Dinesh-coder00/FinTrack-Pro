package com.fintrack.dto;

import java.util.List;

/** Full analytics payload returned to the frontend charts. */
public record AnalyticsDto(
    List<CategorySumDto>  expenseByCategory,
    List<MonthlyTrendDto> monthlyTrend,
    List<CategorySumDto>  savingsGrowth
) {}
