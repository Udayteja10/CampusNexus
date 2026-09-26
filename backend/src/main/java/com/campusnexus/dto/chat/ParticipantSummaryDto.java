package com.campusnexus.dto.chat;

public record ParticipantSummaryDto(
        Long id,
        String username,
        String fullName,
        String department,
        String role
) {}
