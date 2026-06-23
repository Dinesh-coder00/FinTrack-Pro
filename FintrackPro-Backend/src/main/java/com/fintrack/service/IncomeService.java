package com.fintrack.service;

import com.fintrack.dto.IncomeDto;
import com.fintrack.dto.IncomeRequest;
import com.fintrack.entity.Income;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.exception.ForbiddenException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.repository.IncomeRepository;
import com.fintrack.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business logic for income records.
 *
 * Every mutating operation also writes a mirror entry in the
 * {@link Transaction} table so the unified ledger stays in sync.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IncomeService {

    private final IncomeRepository      incomeRepository;
    private final TransactionRepository txnRepository;
    private final UserService           userService;

    // ── Read ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<IncomeDto> getAll(Long userId, Pageable pageable) {
        return incomeRepository
                .findByUserIdOrderByDateDesc(userId, pageable)
                .map(this::toDto);
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    @Transactional
    public IncomeDto create(Long userId, IncomeRequest req) {

        User user = userService.findUser(userId);

        Income income = Income.builder()
                .user(user)
                .title(req.title())
                .amount(req.amount())
                .category(req.category())
                .date(req.date())
                .description(req.description())
                .build();

        income = incomeRepository.save(income);

        // Mirror in the unified ledger
        txnRepository.save(Transaction.builder()
                .user(user)
                .type(Transaction.Type.Income)
                .refId(income.getId())
                .title(req.title())
                .amount(req.amount())
                .category(req.category())
                .date(req.date())
                .build());

        log.debug("Income created id={} user={}", income.getId(), userId);
        return toDto(income);
    }

    @Transactional
    public IncomeDto update(Long userId, Long id, IncomeRequest req) {

        Income income = requireOwned(userId, id);

        income.setTitle(req.title());
        income.setAmount(req.amount());
        income.setCategory(req.category());
        income.setDate(req.date());
        income.setDescription(req.description());

        return toDto(incomeRepository.save(income));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        incomeRepository.delete(requireOwned(userId, id));
        log.debug("Income deleted id={} user={}", id, userId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Load income record and verify it belongs to the requesting user. */
    Income requireOwned(Long userId, Long incomeId) {
        Income income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new ResourceNotFoundException("Income", incomeId));
        if (!income.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied to income id: " + incomeId);
        }
        return income;
    }

    IncomeDto toDto(Income i) {
        return new IncomeDto(
                i.getId(), i.getTitle(), i.getAmount(),
                i.getCategory(), i.getDate(), i.getDescription(),
                i.getCreatedAt());
    }
}
