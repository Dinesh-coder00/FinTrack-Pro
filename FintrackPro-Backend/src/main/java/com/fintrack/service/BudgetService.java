package com.fintrack.service;

import com.fintrack.dto.*;
import com.fintrack.entity.Budget;
import com.fintrack.entity.User;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Manages monthly budget limits.
 *
 * Uses an upsert approach: if a budget already exists for a given user/month/year
 * it is updated in place; otherwise a new record is created.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetService {

    private final BudgetRepository  budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final UserService       userService;
    private final EmailService emailService;

    // ── Read ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<BudgetDto> getAll(Long userId) {
        return budgetRepository
                .findByUserIdOrderByYearDescMonthDesc(userId)
                .stream()
                .map(b -> enrich(b, userId))
                .collect(Collectors.toList());
    }

    /**
     * Return the budget for the current calendar month, or {@code null} if none set.
     */
    @Transactional(readOnly = true)
    public BudgetDto getCurrent(Long userId) {
        LocalDate now = LocalDate.now();
        return budgetRepository
                .findByUserIdAndMonthAndYear(userId, now.getMonthValue(), now.getYear())
                .map(b -> enrich(b, userId))
                .orElse(null);
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    @Transactional
    public BudgetDto upsert(Long userId, BudgetRequest req) {

        User user = userService.findUser(userId);

        Budget budget = budgetRepository
                .findByUserIdAndMonthAndYear(userId, req.month(), req.year())
                .orElse(Budget.builder()
                        .user(user)
                        .month(req.month())
                        .year(req.year())
                        .build());

        budget.setTotalLimit(req.totalLimit());
        if (req.warnPct() != null) {
            budget.setWarnPct(req.warnPct());
        }

        budget = budgetRepository.save(budget);
        log.debug("Budget upserted id={} {}/{}", budget.getId(), req.month(), req.year());

        return enrich(budget, userId);
    }

    // ── Budget-warning check (called from ExpenseService) ────────────────────

    /**
     * Called after a new expense is saved.
     * Logs a warning when the configured threshold is crossed.
     * Fix: use {} placeholders (SLF4J format), not {:.1f} (Python format).
     */
    @Transactional(readOnly = true)
    void checkBudgetWarning(Long userId, LocalDate date) {
        User user = userService.findUser(userId);

        budgetRepository
                .findByUserIdAndMonthAndYear(userId, date.getMonthValue(), date.getYear())
                .ifPresent(b -> {
                    BigDecimal spent = expenseRepository.sumByUserIdAndMonth(
                            userId, date.getYear(), date.getMonthValue());

                    if (b.getTotalLimit().compareTo(BigDecimal.ZERO) == 0) return;

                    double pct = spent
                            .divide(b.getTotalLimit(), 4, RoundingMode.HALF_UP)
                            .doubleValue() * 100;

                    if (pct >= 100) {
                        log.warn("[BUDGET_OVERSPENT] userId={} month={}/{} pct={}%",
                                userId, date.getMonthValue(), date.getYear(),
                                String.format("%.1f", pct));

                        emailService.sendBudgetExceededEmail(
                                user.getEmail(),
                                user.getName(),
                                pct
                        );
                    } else if (pct >= b.getWarnPct()) {
                        log.warn("[BUDGET_WARNING] userId={} month={}/{} pct={}% threshold={}%",
                                userId, date.getMonthValue(), date.getYear(),
                                String.format("%.1f", pct), b.getWarnPct());

                        emailService.sendBudgetWarningEmail(
                                user.getEmail(),
                                user.getName(),
                                pct
                        );
                    }
                });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Attach computed spending metrics to a raw {@link Budget} entity. */
    private BudgetDto enrich(Budget b, Long userId) {
        BigDecimal spent = expenseRepository.sumByUserIdAndMonth(
                userId, b.getYear(), b.getMonth());

        BigDecimal remaining = b.getTotalLimit().subtract(spent);

        double pct = 0.0;
        if (b.getTotalLimit().compareTo(BigDecimal.ZERO) > 0) {
            pct = spent
                    .divide(b.getTotalLimit(), 4, RoundingMode.HALF_UP)
                    .doubleValue() * 100;
        }

        return new BudgetDto(
                b.getId(), b.getMonth(), b.getYear(),
                b.getTotalLimit(), b.getWarnPct(),
                spent, remaining,
                pct, pct >= 100);
    }
}
