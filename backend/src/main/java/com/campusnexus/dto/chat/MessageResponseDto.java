package com.campusnexus.dto.chat;

import java.time.LocalDateTime;

public record MessageResponseDto(
        Long id,
        Long conversationId,
        Long senderId,
        String senderUsername,
        String senderName,
        String content,
        LocalDateTime createdAt
) {}
