package com.fintrack.controller;

import com.fintrack.dto.*;
import com.fintrack.repository.UserRepository;
import com.fintrack.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * GET  /budget  – list all budgets for the user
 * POST /budget  – create or update the budget for a given month/year
 */
@RestController
@RequestMapping("/budget")
public class BudgetController extends BaseController {

    private final BudgetService budgetService;

    public BudgetController(UserRepository userRepository, BudgetService budgetService) {
        super(userRepository);
        this.budgetService = budgetService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetDto>>> getAll(
            @AuthenticationPrincipal UserDetails ud) {

        return ResponseEntity.ok(ApiResponse.ok(
                budgetService.getAll(userId(ud))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetDto>> upsert(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody BudgetRequest req) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Budget saved successfully",
                budgetService.upsert(userId(ud), req)));
    }
}
