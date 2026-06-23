package com.fintrack.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Savings goal returned to the client with computed progress. */
public record SavingsGoalDto(
    Long       id,
    String     title,
    BigDecimal targetAmount,
    BigDecimal savedAmount,
    LocalDate  deadline,
    String     status,
    Double     progressPct,  // (savedAmount / targetAmount) * 100, capped at 100
    Boolean    completed
) {}
