package com.fintrack.controller;

import com.fintrack.dto.*;
import com.fintrack.repository.UserRepository;
import com.fintrack.service.SavingsGoalService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * GET    /savings              – list all savings goals
 * POST   /savings              – create a new goal
 * PATCH  /savings/{id}/contribute?amount=X – add money to a goal
 * DELETE /savings/{id}         – delete a goal
 */
@RestController
@RequestMapping("/savings")
public class SavingsGoalController extends BaseController {

    private final SavingsGoalService savingsService;

    public SavingsGoalController(UserRepository userRepository,
                                  SavingsGoalService savingsService) {
        super(userRepository);
        this.savingsService = savingsService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SavingsGoalDto>>> getAll(
            @AuthenticationPrincipal UserDetails ud) {

        return ResponseEntity.ok(ApiResponse.ok(savingsService.getAll(userId(ud))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SavingsGoalDto>> create(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody SavingsGoalRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Goal created successfully",
                        savingsService.create(userId(ud), req)));
    }

    @PatchMapping("/{id}/contribute")
    public ResponseEntity<ApiResponse<SavingsGoalDto>> contribute(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Contribution added", savingsService.contribute(userId(ud), id, amount)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id) {

        savingsService.delete(userId(ud), id);
        return ResponseEntity.ok(ApiResponse.ok("Goal deleted successfully", null));
    }
}
