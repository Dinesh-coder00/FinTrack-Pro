package com.fintrack.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Lightweight transaction summary used in the dashboard recent-transactions list. */
public record TransactionDto(
    Long       id,
    String     type,      // "Income" or "Expense"
    String     title,
    BigDecimal amount,
    String     category,
    LocalDate  date
) {}
