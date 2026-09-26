package com.campusnexus.controller.chat;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.chat.ConversationResponseDto;
import com.campusnexus.dto.chat.DirectConversationRequest;
import com.campusnexus.dto.chat.MessageResponseDto;
import com.campusnexus.dto.chat.SendMessageRequestDto;
import com.campusnexus.entity.User;
import com.campusnexus.security.AuthorizationService;
import com.campusnexus.service.chat.ChatService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final ChatService chatService;
    private final AuthorizationService authorizationService;

    public ChatController(ChatService chatService, AuthorizationService authorizationService) {
        this.chatService = chatService;
        this.authorizationService = authorizationService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<com.campusnexus.dto.chat.ParticipantSummaryDto>>> searchUsers(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(defaultValue = "15") int limit
    ) {
        User currentUser = resolveUser(authentication);
        List<com.campusnexus.dto.chat.ParticipantSummaryDto> users = chatService.searchUsers(currentUser, query, limit);
        return ResponseEntity.ok(ApiResponse.success("Users found.", users));
    }

    @PostMapping("/conversations/direct")
    public ResponseEntity<ApiResponse<ConversationResponseDto>> createOrGetDirectConversation(
            Authentication authentication,
            @Valid @RequestBody DirectConversationRequest request
    ) {
        User currentUser = resolveUser(authentication);
        ConversationResponseDto conversation = chatService.createOrGetDirectConversation(currentUser, request.recipientId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Conversation retrieved successfully.", conversation));
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationResponseDto>>> getUserConversations(
            Authentication authentication
    ) {
        User currentUser = resolveUser(authentication);
        List<ConversationResponseDto> conversations = chatService.getUserConversations(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Conversations retrieved successfully.", conversations));
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<ApiResponse<ConversationResponseDto>> getConversationById(
            Authentication authentication,
            @PathVariable Long conversationId
    ) {
        User currentUser = resolveUser(authentication);
        ConversationResponseDto conversation = chatService.getConversationById(currentUser, conversationId);
        return ResponseEntity.ok(ApiResponse.success("Conversation details retrieved successfully.", conversation));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<ApiResponse<Page<MessageResponseDto>>> getConversationMessages(
            Authentication authentication,
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        User currentUser = resolveUser(authentication);
        int boundedSize = Math.max(1, Math.min(size, 100));
        Pageable pageable = PageRequest.of(page, boundedSize, Sort.by("createdAt").ascending());
        Page<MessageResponseDto> messages = chatService.getConversationMessages(currentUser, conversationId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Messages retrieved successfully.", messages));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<ApiResponse<MessageResponseDto>> sendMessageRest(
            Authentication authentication,
            @PathVariable Long conversationId,
            @Valid @RequestBody SendMessageRequestDto request
    ) {
        User currentUser = resolveUser(authentication);
        MessageResponseDto message = chatService.sendMessage(currentUser, conversationId, request.content());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Message sent successfully.", message));
    }

    private User resolveUser(Authentication authentication) {
        return authorizationService.resolveAuthenticatedUser(authentication)
                .orElseThrow(() -> new AccessDeniedException("Authentication required to access chat resources."));
    }
}
