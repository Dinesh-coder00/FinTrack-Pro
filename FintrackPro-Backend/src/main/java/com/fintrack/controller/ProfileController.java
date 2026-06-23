package com.fintrack.controller;

import com.fintrack.dto.*;
import com.fintrack.repository.UserRepository;
import com.fintrack.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * GET   /profile  – return the authenticated user's public profile
 * PATCH /profile  – update name, currency, darkMode, avatarUrl
 */
@RestController
@RequestMapping("/profile")
public class ProfileController extends BaseController {

    private final UserService userService;

    public ProfileController(UserRepository userRepository, UserService userService) {
        super(userRepository);
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<UserDto>> get(
            @AuthenticationPrincipal UserDetails ud) {

        return ResponseEntity.ok(ApiResponse.ok(
                userService.getProfile(userId(ud))));
    }

    @PatchMapping
    public ResponseEntity<ApiResponse<UserDto>> update(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody UpdateProfileRequest req) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Profile updated successfully",
                userService.updateProfile(userId(ud), req)));
    }
}
