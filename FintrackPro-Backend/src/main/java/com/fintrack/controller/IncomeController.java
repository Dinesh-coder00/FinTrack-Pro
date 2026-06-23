package com.fintrack.controller;

import com.fintrack.dto.*;
import com.fintrack.repository.UserRepository;
import com.fintrack.service.IncomeService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * GET    /income          – paginated income list
 * POST   /income          – create income
 * PUT    /income/{id}     – update income
 * DELETE /income/{id}     – delete income
 */
@RestController
@RequestMapping("/income")
@Slf4j
public class IncomeController extends BaseController {

    private final IncomeService incomeService;

    public IncomeController(UserRepository userRepository, IncomeService incomeService) {
        super(userRepository);
        this.incomeService = incomeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<IncomeDto>>> list(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.ok(
                incomeService.getAll(userId(ud), pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<IncomeDto>> create(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody IncomeRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Income added successfully",
                        incomeService.create(userId(ud), req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<IncomeDto>> update(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id,
            @Valid @RequestBody IncomeRequest req) {

        return ResponseEntity.ok(ApiResponse.ok(
                incomeService.update(userId(ud), id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id) {

        incomeService.delete(userId(ud), id);
        return ResponseEntity.ok(ApiResponse.ok("Income deleted successfully", null));
    }
}
