package com.campusnexus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Verification code is required")
        String code,

        @NotBlank(message = "New password is required")
        @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
        String newPassword,

        String confirmPassword
) {
}
