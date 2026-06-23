package com.fintrack.controller;

import com.fintrack.entity.User;
import com.fintrack.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Shared helper that resolves the authenticated user's database ID
 * from the Spring Security principal.
 *
 * All protected controllers extend this class.
 * Uses constructor injection (no Lombok) to avoid the null-field trap.
 */
public abstract class BaseController {

    protected final UserRepository userRepository;

    protected BaseController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Resolve the database primary-key id from the authenticated principal.
     *
     * @param ud the {@link UserDetails} injected via {@code @AuthenticationPrincipal}
     * @return user id
     * @throws IllegalStateException if the principal email has no matching user row
     */
    protected Long userId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
                .map(User::getId)
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user not found in database: " + ud.getUsername()));
    }
}
