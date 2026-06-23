package com.fintrack.controller;

import com.fintrack.dto.*;
import com.fintrack.repository.UserRepository;
import com.fintrack.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * GET /analytics – returns all chart data for the analytics dashboard.
 */
@RestController
@RequestMapping("/analytics")
public class AnalyticsController extends BaseController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(UserRepository userRepository,
                                AnalyticsService analyticsService) {
        super(userRepository);
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AnalyticsDto>> get(
            @AuthenticationPrincipal UserDetails ud) {

        return ResponseEntity.ok(ApiResponse.ok(
                analyticsService.getAnalytics(userId(ud))));
    }
}
