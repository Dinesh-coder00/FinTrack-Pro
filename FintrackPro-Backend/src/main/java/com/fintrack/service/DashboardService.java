package com.fintrack.service;

import com.fintrack.dto.DashboardDto;
import com.fintrack.dto.TransactionDto;
import com.fintrack.repository.ExpenseRepository;
import com.fintrack.repository.IncomeRepository;
import com.fintrack.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Assembles all data needed by the main dashboard view in a single call.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final IncomeRepository      incomeRepository;
    private final ExpenseRepository     expenseRepository;
    private final TransactionRepository txnRepository;
    private final BudgetService         budgetService;

    /**
     * Build the full {@link DashboardDto} for a user.
     *
     * @param userId authenticated user's id
     */
    @Transactional(readOnly = true)
    public DashboardDto getDashboard(Long userId) {

        LocalDate now   = LocalDate.now();
        int month       = now.getMonthValue();
        int year        = now.getYear();

        // All-time totals
        BigDecimal totalIncome  = incomeRepository.sumByUserId(userId);
        BigDecimal totalExpense = expenseRepository.sumByUserId(userId);

        // This-month totals
        BigDecimal monthlyIncome  = incomeRepository.sumByUserIdAndMonth(userId, year, month);
        BigDecimal monthlyExpense = expenseRepository.sumByUserIdAndMonth(userId, year, month);

        // Latest 5 transactions for the dashboard widget
        List<TransactionDto> recent = txnRepository
                .findTop5ByUserIdOrderByDateDesc(userId)
                .stream()
                .map(t -> new TransactionDto(
                        t.getId(), t.getType().name(), t.getTitle(),
                        t.getAmount(), t.getCategory(), t.getDate()))
                .collect(Collectors.toList());

        return new DashboardDto(
                totalIncome,
                totalExpense,
                totalIncome.subtract(totalExpense),
                monthlyIncome,
                monthlyExpense,
                monthlyIncome.subtract(monthlyExpense),
                budgetService.getCurrent(userId),
                recent);
    }
}
