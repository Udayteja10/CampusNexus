package com.campusnexus.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyResetCodeRequest(
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Verification code is required")
        String code
) {
}
