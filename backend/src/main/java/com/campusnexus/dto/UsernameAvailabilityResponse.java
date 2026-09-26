package com.campusnexus.dto;

public record UsernameAvailabilityResponse(
        String username,
        boolean available,
        String message
) {
}
