package com.fintrack.controller;

import com.fintrack.dto.*;
import com.fintrack.repository.UserRepository;
import com.fintrack.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * GET    /expense                        – paginated list (with optional filters)
 * GET    /expense?category=Food          – filter by category
 * GET    /expense?from=2024-01-01&to=... – filter by date range
 * GET    /expense?search=coffee          – keyword search
 * POST   /expense                        – create
 * PUT    /expense/{id}                   – update
 * DELETE /expense/{id}                   – delete
 */
@RestController
@RequestMapping("/expense")
public class ExpenseController extends BaseController {

    private final ExpenseService expenseService;

    public ExpenseController(UserRepository userRepository, ExpenseService expenseService) {
        super(userRepository);
        this.expenseService = expenseService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ExpenseDto>>> list(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(required = false) String category,
            @RequestParam(required = false)
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false)
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(ApiResponse.ok(
                expenseService.getAll(userId(ud), category, from, to, search,
                        PageRequest.of(page, size))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseDto>> create(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody ExpenseRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Expense added successfully",
                        expenseService.create(userId(ud), req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseDto>> update(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest req) {

        return ResponseEntity.ok(ApiResponse.ok(
                expenseService.update(userId(ud), id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id) {

        expenseService.delete(userId(ud), id);
        return ResponseEntity.ok(ApiResponse.ok("Expense deleted successfully", null));
    }
}
