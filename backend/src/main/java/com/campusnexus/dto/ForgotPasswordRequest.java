package com.campusnexus.dto;

import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "Email or username is required")
        String email
) {
}
