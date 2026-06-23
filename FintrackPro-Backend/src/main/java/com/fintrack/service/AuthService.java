package com.fintrack.service;

import com.fintrack.dto.AuthResponse;
import com.fintrack.dto.LoginRequest;
import com.fintrack.dto.RegisterRequest;
import com.fintrack.entity.User;
import com.fintrack.exception.BusinessException;
import com.fintrack.repository.UserRepository;
import com.fintrack.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fintrack.entity.PasswordResetOtp;
import com.fintrack.repository.PasswordResetOtpRepository;
import java.time.LocalDateTime;
import java.util.Random;
import com.fintrack.dto.ForgotPasswordRequest;
import com.fintrack.dto.VerifyOtpRequest;
import com.fintrack.dto.ResetPasswordRequest;


/**
 * Handles user registration and login, issuing a JWT on success.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtils              jwtUtils;
    private final EmailService emailService;
    private final PasswordResetOtpRepository passwordResetOtpRepository;

    /**
     * Register a new user account.
     *
     * @throws BusinessException if the email is already taken (HTTP 409)
     */
    @Transactional
    public AuthResponse register(RegisterRequest req) {

        if (userRepository.existsByEmail(req.email())) {
            throw new BusinessException(
                    "An account with this email already exists: " + req.email());
        }

        User user = User.builder()
                .name(req.name())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .currency(req.currency() != null ? req.currency() : "INR")
                .build();

        user = userRepository.save(user);

        emailService.sendWelcomeEmail(
                user.getEmail(),
                user.getName()
        );

     log.info("New user registered: {}", user.getEmail());

     return toAuthResponse(user, jwtUtils.generateToken(user.getEmail()));
    }

    /**
     * Authenticate a user and return a JWT.
     *
     * Spring Security throws {@link org.springframework.security.authentication.BadCredentialsException}
     * on wrong credentials; the global exception handler maps that to HTTP 401.
     */
    public AuthResponse login(LoginRequest req) {

        // Delegate to Spring Security — throws BadCredentialsException on failure
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));

        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found: " + req.email()));

        log.info("User logged in: {}", user.getEmail());
        emailService.sendLoginAlertEmail(
                user.getEmail(),
                user.getName()
        );

        return toAuthResponse(user, jwtUtils.generateToken(user.getEmail()));
    }
    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {

        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found: " + req.email()));

        String otp = String.format("%06d", new Random().nextInt(999999));

        PasswordResetOtp resetOtp = PasswordResetOtp.builder()
                .email(user.getEmail())
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .build();

        passwordResetOtpRepository.save(resetOtp);

        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    @Transactional(readOnly = true)
    public boolean verifyOtp(VerifyOtpRequest req) {

        PasswordResetOtp resetOtp = passwordResetOtpRepository
                .findByEmailAndOtp(req.email(), req.otp())
                .orElseThrow(() -> new BusinessException("Invalid OTP"));

        if (resetOtp.getUsed()) {
            throw new BusinessException("OTP already used");
        }

        if (resetOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BusinessException("OTP expired");
        }

        return true;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {

        PasswordResetOtp resetOtp = passwordResetOtpRepository
                .findByEmailAndOtp(req.email(), req.otp())
                .orElseThrow(() -> new BusinessException("Invalid OTP"));

        if (resetOtp.getUsed()) {
            throw new BusinessException("OTP already used");
        }

        if (resetOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BusinessException("OTP expired");
        }

        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found: " + req.email()));

        user.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);

        resetOtp.setUsed(true);
        passwordResetOtpRepository.save(resetOtp);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private AuthResponse toAuthResponse(User user, String token) {
        return new AuthResponse(
                token, "Bearer",
                user.getId(), user.getName(), user.getEmail(),
                user.getCurrency(), user.getDarkMode());
    }
}
