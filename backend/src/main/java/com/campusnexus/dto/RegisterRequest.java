package com.campusnexus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 100, message = "Full name must not exceed 100 characters")
        String fullName,

        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
        @Pattern(regexp = "^[a-z0-9_]{3,20}$", message = "Username must contain only lowercase alphanumeric characters and underscores")
        String username,

        @NotBlank(message = "HTNO is required")
        String htno,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        String password,

        String confirmPassword
) {
    public RegisterRequest(String email, String password) {
        this("Test Student", null, null, password, password);
    }
}
