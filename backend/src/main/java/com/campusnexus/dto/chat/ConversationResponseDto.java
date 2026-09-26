package com.campusnexus.dto.chat;

import java.time.LocalDateTime;

public record ConversationResponseDto(
        Long id,
        ParticipantSummaryDto otherParticipant,
        MessageResponseDto lastMessage,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
