package com.fintrack.controller;

import com.fintrack.dto.*;

import com.fintrack.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import com.fintrack.dto.ForgotPasswordRequest;
import com.fintrack.dto.VerifyOtpRequest;
import com.fintrack.dto.ResetPasswordRequest;


/**
 * POST /register  – create a new user account
 * POST /login     – authenticate and receive a JWT
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** Register a new user. Returns 201 Created + JWT. */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration successful", authService.register(req)));
    }

    /** Authenticate an existing user. Returns 200 OK + JWT. */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest req) {

        return ResponseEntity.ok(ApiResponse.ok(authService.login(req)));
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest req) {

        authService.forgotPassword(req);

        return ResponseEntity.ok(
                ApiResponse.ok("OTP sent to your email")
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest req) {

        authService.verifyOtp(req);

        return ResponseEntity.ok(
                ApiResponse.ok("OTP verified successfully")
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest req) {

        authService.resetPassword(req);

        return ResponseEntity.ok(
                ApiResponse.ok("Password reset successfully")
        );
    }
}
