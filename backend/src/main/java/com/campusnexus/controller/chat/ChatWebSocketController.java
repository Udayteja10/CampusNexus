package com.campusnexus.controller.chat;

import com.campusnexus.dto.chat.SendMessageRequestDto;
import com.campusnexus.entity.User;
import com.campusnexus.repository.UserRepository;
import com.campusnexus.service.chat.ChatService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(ChatWebSocketController.class);

    private final ChatService chatService;
    private final UserRepository userRepository;

    public ChatWebSocketController(ChatService chatService, UserRepository userRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    @MessageMapping("/chat.send")
    public void handleIncomingMessage(
            @Payload @Valid SendMessageRequestDto request,
            Principal principal
    ) {
        if (principal == null) {
            log.warn("Rejected STOMP send: Unauthenticated principal");
            throw new AccessDeniedException("Unauthenticated WebSocket message sender.");
        }

        String email;
        if (principal instanceof Authentication auth) {
            email = auth.getName();
        } else {
            email = principal.getName();
        }

        User sender = userRepository.findByEmail(email)
                .filter(User::isEnabled)
                .orElseThrow(() -> new AccessDeniedException("Sender user not found or disabled: " + email));

        log.debug("Processing WebSocket message from user {} for conversation {}", sender.getEmail(), request.conversationId());
        chatService.sendMessage(sender, request.conversationId(), request.content());
    }
}
