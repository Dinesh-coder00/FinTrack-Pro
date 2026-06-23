package com.fintrack.service;

import com.fintrack.dto.ExpenseDto;
import com.fintrack.dto.ExpenseRequest;
import com.fintrack.entity.Expense;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.exception.ForbiddenException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.repository.ExpenseRepository;
import com.fintrack.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Business logic for expense records.
 *
 * Supports filtering by category, date range, and keyword search.
 * After every insert the budget-warning check is triggered.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseService {

    private final ExpenseRepository     expenseRepository;
    private final TransactionRepository txnRepository;
    private final UserService           userService;
    private final BudgetService         budgetService;

    // ── Read ──────────────────────────────────────────────────────────────────

    /**
     * Return a paginated, optionally filtered list of expenses.
     * Priority: search > category+dates > category > dates > all.
     */
    @Transactional(readOnly = true)
    public Page<ExpenseDto> getAll(Long userId,
                                   String    category,
                                   LocalDate from,
                                   LocalDate to,
                                   String    search,
                                   Pageable  pageable) {

        // 1. Keyword search takes priority
        if (search != null && !search.isBlank()) {
            return expenseRepository
                    .searchByTitle(userId, search.trim(), pageable)
                    .map(this::toDto);
        }

        // Parse category safely
        Expense.Category cat = null;
        if (category != null && !category.isBlank()) {
            try {
                cat = Expense.Category.valueOf(category);
            } catch (IllegalArgumentException e) {
                // Unknown category — fall through to unfiltered
            }
        }

        // 2. Category + date range
        if (cat != null && from != null) {
            LocalDate end = (to != null) ? to : LocalDate.now();
            return expenseRepository
                    .findByUserIdAndCategoryAndDateBetweenOrderByDateDesc(
                            userId, cat, from, end, pageable)
                    .map(this::toDto);
        }

        // 3. Category only
        if (cat != null) {
            return expenseRepository
                    .findByUserIdAndCategoryOrderByDateDesc(userId, cat, pageable)
                    .map(this::toDto);
        }

        // 4. Date range only
        if (from != null) {
            LocalDate end = (to != null) ? to : LocalDate.now();
            return expenseRepository
                    .findByUserIdAndDateBetweenOrderByDateDesc(userId, from, end, pageable)
                    .map(this::toDto);
        }

        // 5. All expenses
        return expenseRepository
                .findByUserIdOrderByDateDesc(userId, pageable)
                .map(this::toDto);
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    @Transactional
    public ExpenseDto create(Long userId, ExpenseRequest req) {

        User user = userService.findUser(userId);

        Expense expense = Expense.builder()
                .user(user)
                .title(req.title())
                .amount(req.amount())
                .category(Expense.Category.valueOf(req.category()))
                .date(req.date())
                .description(req.description())
                .build();

        expense = expenseRepository.save(expense);

        // Mirror in the unified ledger
        txnRepository.save(Transaction.builder()
                .user(user)
                .type(Transaction.Type.Expense)
                .refId(expense.getId())
                .title(req.title())
                .amount(req.amount())
                .category(req.category())
                .date(req.date())
                .build());

        // Trigger budget warning check
        budgetService.checkBudgetWarning(userId, expense.getDate());

        log.debug("Expense created id={} user={}", expense.getId(), userId);
        return toDto(expense);
    }

    @Transactional
    public ExpenseDto update(Long userId, Long id, ExpenseRequest req) {

        Expense expense = requireOwned(userId, id);

        expense.setTitle(req.title());
        expense.setAmount(req.amount());
        expense.setCategory(Expense.Category.valueOf(req.category()));
        expense.setDate(req.date());
        expense.setDescription(req.description());

        return toDto(expenseRepository.save(expense));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        expenseRepository.delete(requireOwned(userId, id));
        log.debug("Expense deleted id={} user={}", id, userId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    Expense requireOwned(Long userId, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", expenseId));
        if (!expense.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied to expense id: " + expenseId);
        }
        return expense;
    }

    ExpenseDto toDto(Expense e) {
        return new ExpenseDto(
                e.getId(), e.getTitle(), e.getAmount(),
                e.getCategory().name(), e.getDate(), e.getDescription(),
                e.getCreatedAt());
    }
}
