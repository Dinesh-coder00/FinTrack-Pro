package com.fintrack.dto;

import java.math.BigDecimal;
import java.util.List;

/** Aggregated data for the main dashboard view. */
public record DashboardDto(
    BigDecimal          totalIncome,
    BigDecimal          totalExpense,
    BigDecimal          balance,
    BigDecimal          monthlyIncome,
    BigDecimal          monthlyExpense,
    BigDecimal          monthlyBalance,
    BudgetDto           currentBudget,      // may be null if none set
    List<TransactionDto> recentTransactions  // latest 5
) {}
