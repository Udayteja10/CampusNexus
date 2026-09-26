package com.campusnexus.dto;

public record UpdateProfileRequest(
        String fullName,
        String username
) {
}
