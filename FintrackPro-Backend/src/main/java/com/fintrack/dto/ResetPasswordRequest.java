package com.fintrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ResetPasswordRequest(

        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        String email,

        @NotBlank(message = "OTP is required")
        @Pattern(regexp = "\\d{6}", message = "OTP must be 6 digits")
        String otp,

        @NotBlank(message = "New password is required")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
                message = "Password must be at least 8 characters and include uppercase, lowercase, and a digit"
        )
        String newPassword

) {}
