package com.campusnexus.dto.chat;

import jakarta.validation.constraints.NotNull;

public record DirectConversationRequest(
        @NotNull(message = "Recipient user ID is required")
        Long recipientId
) {}
