package com.fintrack.service;

import com.fintrack.dto.SavingsGoalDto;
import com.fintrack.dto.SavingsGoalRequest;
import com.fintrack.entity.SavingsGoal;
import com.fintrack.entity.User;
import com.fintrack.exception.ForbiddenException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.repository.SavingsGoalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Manages savings goals: creation, contribution tracking, and deletion.
 *
 * A goal is automatically marked {@link SavingsGoal.Status#Completed} when
 * the saved amount reaches or exceeds the target.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SavingsGoalService {

    private final SavingsGoalRepository goalRepository;
    private final UserService           userService;
    private final EmailService emailService;

    // ── Read ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<SavingsGoalDto> getAll(Long userId) {
        return goalRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    @Transactional
    public SavingsGoalDto create(Long userId, SavingsGoalRequest req) {

        User user = userService.findUser(userId);

        SavingsGoal goal = SavingsGoal.builder()
                .user(user)
                .title(req.title())
                .targetAmount(req.targetAmount())
                .savedAmount(req.savedAmount() != null
                        ? req.savedAmount()
                        : BigDecimal.ZERO)
                .deadline(req.deadline())
                .build();

        goal = goalRepository.save(goal);
        log.debug("Savings goal created id={} user={}", goal.getId(), userId);
        return toDto(goal);
    }

    /**
     * Add {@code amount} to the saved total of an existing goal.
     * Automatically completes the goal if the target is reached.
     */
    @Transactional
    public SavingsGoalDto contribute(Long userId, Long goalId, BigDecimal amount) {

        SavingsGoal goal = requireOwned(userId, goalId);

        goal.setSavedAmount(goal.getSavedAmount().add(amount));

        if (goal.getSavedAmount().compareTo(goal.getTargetAmount()) >= 0
                && goal.getStatus() != SavingsGoal.Status.Completed) {

            goal.setStatus(SavingsGoal.Status.Completed);
            log.info("Savings goal COMPLETED id={} user={}", goalId, userId);

            User user = goal.getUser();

            emailService.sendGoalCompletedEmail(
                    user.getEmail(),
                    user.getName(),
                    goal.getTitle()
            );
        }

        return toDto(goalRepository.save(goal));
    }

    @Transactional
    public void delete(Long userId, Long goalId) {
        goalRepository.delete(requireOwned(userId, goalId));
        log.debug("Savings goal deleted id={} user={}", goalId, userId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private SavingsGoal requireOwned(Long userId, Long goalId) {
        SavingsGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("SavingsGoal", goalId));
        if (!goal.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied to savings goal id: " + goalId);
        }
        return goal;
    }

    private SavingsGoalDto toDto(SavingsGoal g) {
        // Guard against zero target (shouldn't happen with validation, but be safe)
        double pct = 0.0;
        if (g.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            pct = g.getSavedAmount()
                    .divide(g.getTargetAmount(), 4, RoundingMode.HALF_UP)
                    .doubleValue() * 100;
        }

        return new SavingsGoalDto(
                g.getId(), g.getTitle(),
                g.getTargetAmount(), g.getSavedAmount(),
                g.getDeadline(), g.getStatus().name(),
                Math.min(pct, 100.0),
                g.getStatus() == SavingsGoal.Status.Completed);
    }
}
