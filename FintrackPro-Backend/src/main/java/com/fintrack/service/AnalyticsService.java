package com.fintrack.service;

import com.fintrack.dto.AnalyticsDto;
import com.fintrack.dto.CategorySumDto;
import com.fintrack.dto.MonthlyTrendDto;
import com.fintrack.repository.ExpenseRepository;
import com.fintrack.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Produces aggregated analytics data used by the frontend Chart.js widgets:
 *
 * <ul>
 *   <li>Pie chart  — expense totals per category</li>
 *   <li>Bar chart  — monthly income vs expense trend (last 12 months)</li>
 *   <li>Line chart — cumulative net savings over time</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository  incomeRepository;

    /**
     * Build the full analytics payload for a user.
     *
     * @param userId authenticated user's id
     */
    @Transactional(readOnly = true)
    public AnalyticsDto getAnalytics(Long userId) {

        // ── 1. Expense by category (pie chart) ─────────────────────────────
        List<CategorySumDto> byCategory = expenseRepository
                .sumByCategory(userId)
                .stream()
                .map(row -> new CategorySumDto(
                        row[0].toString(),          // category name (String from DB)
                        (BigDecimal) row[1]))        // sum amount
                .collect(Collectors.toList());

        // ── 2. Monthly trend – last 12 months ───────────────────────────────
        LocalDate from = LocalDate.now().minusMonths(11).withDayOfMonth(1);

        // Expense map: "YYYY-MM" -> total
        Map<String, BigDecimal> expMap = expenseRepository
                .monthlyExpenseTrend(userId, from)
                .stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> (BigDecimal) row[1],
                        (a, b) -> a));   // merge function — handles duplicate keys safely

        // Income map: "YYYY-MM" -> total
        Map<String, BigDecimal> incMap = incomeRepository
                .monthlyIncomeTrend(userId, from)
                .stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> (BigDecimal) row[1],
                        (a, b) -> a));

        // Build unified list covering every month in the 12-month range
        List<MonthlyTrendDto> trend = buildMonthRange(from).stream()
                .map(m -> new MonthlyTrendDto(
                        m,
                        incMap.getOrDefault(m, BigDecimal.ZERO),
                        expMap.getOrDefault(m, BigDecimal.ZERO)))
                .collect(Collectors.toList());

        // ── 3. Savings growth — cumulative net balance per month ────────────
        BigDecimal cumulative = BigDecimal.ZERO;
        List<CategorySumDto> savingsGrowth = new ArrayList<>();
        for (MonthlyTrendDto t : trend) {
            cumulative = cumulative.add(t.income()).subtract(t.expense());
            savingsGrowth.add(new CategorySumDto(t.month(), cumulative));
        }

        return new AnalyticsDto(byCategory, trend, savingsGrowth);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Generate a list of "YYYY-MM" strings for each month
     * from {@code from} (inclusive) up to and including the current month.
     */
    private List<String> buildMonthRange(LocalDate from) {
        List<String> months = new ArrayList<>();
        LocalDate cursor = from;
        LocalDate end    = LocalDate.now().withDayOfMonth(1);
        while (!cursor.isAfter(end)) {
            months.add(String.format("%d-%02d", cursor.getYear(), cursor.getMonthValue()));
            cursor = cursor.plusMonths(1);
        }
        return months;
    }
}
