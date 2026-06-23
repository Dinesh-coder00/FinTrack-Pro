package com.fintrack.controller;

import com.fintrack.dto.*;
import com.fintrack.repository.UserRepository;
import com.fintrack.service.DashboardService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * GET /dashboard – returns aggregated financial summary for the current user.
 */
@RestController
@RequestMapping("/dashboard")
@Slf4j
public class DashboardController extends BaseController {

    private final DashboardService dashboardService;

    public DashboardController(UserRepository userRepository,
                               DashboardService dashboardService) {
        super(userRepository);
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardDto>> get(
            @AuthenticationPrincipal UserDetails ud) {

        return ResponseEntity.ok(ApiResponse.ok(
                dashboardService.getDashboard(userId(ud))));
    }
}
