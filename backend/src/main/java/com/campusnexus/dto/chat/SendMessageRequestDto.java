package com.campusnexus.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SendMessageRequestDto(
        @NotNull(message = "Conversation ID is required")
        Long conversationId,

        @NotBlank(message = "Message content must not be blank")
        @Size(max = 2000, message = "Message content must not exceed 2000 characters")
        String content
) {}
