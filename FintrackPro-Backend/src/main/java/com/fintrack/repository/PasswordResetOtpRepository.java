package com.fintrack.repository;

import com.fintrack.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetOtpRepository
        extends JpaRepository<PasswordResetOtp, Long> {

    Optional<PasswordResetOtp> findByEmailAndOtp(
            String email,
            String otp
    );
}
