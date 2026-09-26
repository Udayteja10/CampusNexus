package com.campusnexus.dto;

public record RegisterResponse(
        String email,
        String username,
        String htno,
        String message,
        boolean verificationRequired
) {
}
