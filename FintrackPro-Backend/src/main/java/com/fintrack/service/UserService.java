package com.fintrack.service;

import com.fintrack.dto.UpdateProfileRequest;
import com.fintrack.dto.UserDto;
import com.fintrack.entity.User;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manages user profile reads and updates.
 *
 * {@link #findUser(Long)} is intentionally {@code public} so sibling services
 * (BudgetService, IncomeService, ExpenseService, SavingsGoalService) can
 * resolve the User entity without importing the repository directly.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // ── Public API ────────────────────────────────────────────────────────────

    /** Return the public profile DTO for the given user. */
    @Transactional(readOnly = true)
    public UserDto getProfile(Long userId) {
        return toDto(findUser(userId));
    }

    /** Apply non-null fields from the request to the user record. */
    @Transactional
    public UserDto updateProfile(Long userId, UpdateProfileRequest req) {

        User user = findUser(userId);

        if (req.name()      != null) user.setName(req.name());
        if (req.currency()  != null) user.setCurrency(req.currency());
        if (req.darkMode()  != null) user.setDarkMode(req.darkMode());
        if (req.avatarUrl() != null) user.setAvatarUrl(req.avatarUrl());

        return toDto(userRepository.save(user));
    }

    // ── Shared helper (public — used by sibling services) ────────────────────

    /**
     * Load a {@link User} entity by id, throwing {@link ResourceNotFoundException}
     * (HTTP 404) if absent.
     *
     * @param id the user's database primary key
     * @return the managed {@link User} entity
     */
    public User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private UserDto toDto(User u) {
        return new UserDto(
                u.getId(), u.getName(), u.getEmail(),
                u.getAvatarUrl(), u.getCurrency(), u.getDarkMode(),
                u.getCreatedAt());
    }
}
