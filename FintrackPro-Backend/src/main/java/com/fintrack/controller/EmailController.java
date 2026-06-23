package com.fintrack.controller;

import com.fintrack.dto.ApiResponse;
import com.fintrack.entity.User;
import com.fintrack.repository.UserRepository;
import com.fintrack.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/email/test")
public class EmailController extends BaseController {

    private final EmailService emailService;

    public EmailController(UserRepository userRepository,
                           EmailService emailService) {
        super(userRepository);
        this.emailService = emailService;
    }

    @PostMapping("/welcome")
    public ResponseEntity<ApiResponse<String>> testWelcome(
            @AuthenticationPrincipal UserDetails ud) {

        User user = userRepository.findByEmail(ud.getUsername())
                .orElseThrow();

        emailService.sendWelcomeEmail(
                user.getEmail(),
                user.getName()
        );

        return ResponseEntity.ok(ApiResponse.ok("Welcome email sent"));
    }
}