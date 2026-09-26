package com.campusnexus.service.chat;

import com.campusnexus.dto.chat.ConversationResponseDto;
import com.campusnexus.dto.chat.MessageResponseDto;
import com.campusnexus.dto.chat.ParticipantSummaryDto;
import com.campusnexus.entity.User;
import com.campusnexus.entity.chat.Conversation;
import com.campusnexus.entity.chat.ConversationParticipant;
import com.campusnexus.entity.chat.Message;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.UserRepository;
import com.campusnexus.repository.chat.ConversationParticipantRepository;
import com.campusnexus.repository.chat.ConversationRepository;
import com.campusnexus.repository.chat.MessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessageSendingOperations messagingTemplate;
    private final com.campusnexus.service.AuditLogService auditLogService;

    public ChatService(
            ConversationRepository conversationRepository,
            ConversationParticipantRepository participantRepository,
            MessageRepository messageRepository,
            UserRepository userRepository,
            SimpMessageSendingOperations messagingTemplate,
            com.campusnexus.service.AuditLogService auditLogService
    ) {
        this.conversationRepository = conversationRepository;
        this.participantRepository = participantRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public ConversationResponseDto createOrGetDirectConversation(User currentUser, Long recipientId) {
        if (recipientId == null) {
            throw new IllegalArgumentException("Recipient user ID must not be null.");
        }
        if (Objects.equals(currentUser.getId(), recipientId)) {
            throw new IllegalArgumentException("Cannot create a conversation with yourself.");
        }

        User recipient = userRepository.findById(recipientId)
                .filter(User::isEnabled)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient user not found with ID: " + recipientId));

        Optional<Conversation> existing = conversationRepository.findDirectConversationBetweenUsers(currentUser.getId(), recipientId);
        if (existing.isPresent()) {
            Conversation conv = existing.get();
            return mapToConversationDto(conv, currentUser);
        }

        Conversation conversation = new Conversation();
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());
        Conversation savedConversation = conversationRepository.save(conversation);

        ConversationParticipant p1 = new ConversationParticipant(savedConversation, currentUser);
        p1.setJoinedAt(LocalDateTime.now());
        ConversationParticipant p2 = new ConversationParticipant(savedConversation, recipient);
        p2.setJoinedAt(LocalDateTime.now());

        participantRepository.save(p1);
        participantRepository.save(p2);

        auditLogService.logEvent(currentUser, "CHAT_CONVERSATION_CREATED", "CONVERSATION", savedConversation.getId().toString(), null, null, "{\"recipientId\":" + recipientId + "}");

        log.info("Created direct conversation id: {} between user {} and user {}", savedConversation.getId(), currentUser.getId(), recipientId);
        return mapToConversationDto(savedConversation, currentUser);
    }

    @Transactional(readOnly = true)
    public List<ConversationResponseDto> getUserConversations(User currentUser) {
        List<Conversation> conversations = conversationRepository.findConversationsByUserId(currentUser.getId());
        return conversations.stream()
                .map(conv -> mapToConversationDto(conv, currentUser))
                .toList();
    }

    @Transactional(readOnly = true)
    public ConversationResponseDto getConversationById(User currentUser, Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with ID: " + conversationId));

        boolean isParticipant = participantRepository.existsByConversationIdAndUserId(conversationId, currentUser.getId());
        if (!isParticipant) {
            throw new AccessDeniedException("You are not a participant in this conversation.");
        }

        return mapToConversationDto(conversation, currentUser);
    }

    @Transactional(readOnly = true)
    public Page<MessageResponseDto> getConversationMessages(User currentUser, Long conversationId, Pageable pageable) {
        if (!conversationRepository.existsById(conversationId)) {
            throw new ResourceNotFoundException("Conversation not found with ID: " + conversationId);
        }

        boolean isParticipant = participantRepository.existsByConversationIdAndUserId(conversationId, currentUser.getId());
        if (!isParticipant) {
            throw new AccessDeniedException("You are not a participant in this conversation.");
        }

        Page<Message> messagePage = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId, pageable);
        return messagePage.map(this::mapToMessageDto);
    }

    @Transactional
    public MessageResponseDto sendMessage(User sender, Long conversationId, String rawContent) {
        if (conversationId == null) {
            throw new IllegalArgumentException("Conversation ID must not be null.");
        }
        if (rawContent == null || rawContent.trim().isEmpty()) {
            throw new IllegalArgumentException("Message content must not be blank.");
        }

        String trimmedContent = rawContent.trim();
        if (trimmedContent.length() > 2000) {
            throw new IllegalArgumentException("Message content must not exceed 2000 characters.");
        }

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with ID: " + conversationId));

        boolean isParticipant = participantRepository.existsByConversationIdAndUserId(conversationId, sender.getId());
        if (!isParticipant) {
            throw new AccessDeniedException("You are not a participant in this conversation.");
        }

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(trimmedContent);
        message.setCreatedAt(LocalDateTime.now());

        Message savedMessage = messageRepository.save(message);

        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        MessageResponseDto messageDto = mapToMessageDto(savedMessage);

        auditLogService.logEvent(sender, "CHAT_MESSAGE_SENT", "MESSAGE", savedMessage.getId().toString(), null, null, "{\"conversationId\":" + conversationId + "}");

        // Real-time broadcast to all participants subscribed to the conversation topic
        String destination = "/topic/conversations/" + conversationId;
        try {
            messagingTemplate.convertAndSend(destination, messageDto);
            log.debug("Broadcasted message {} to destination {}", savedMessage.getId(), destination);
        } catch (Exception e) {
            log.warn("Failed to broadcast message to WebSocket destination {}: {}", destination, e.getMessage());
        }

        return messageDto;
    }

    @Transactional(readOnly = true)
    public List<ParticipantSummaryDto> searchUsers(User currentUser, String query, int limit) {
        String cleanQuery = (query != null) ? query.trim() : "";
        int bound = Math.max(1, Math.min(limit, 30));
        Pageable pageable = PageRequest.of(0, bound);
        List<User> users = userRepository.searchUsersForChat(cleanQuery, currentUser.getId(), pageable);
        return users.stream().map(u -> new ParticipantSummaryDto(
                u.getId(),
                u.getUsername() != null ? u.getUsername() : u.getEmail(),
                u.getFullName() != null ? u.getFullName() : (u.getUsername() != null ? u.getUsername() : u.getEmail()),
                u.getDepartment() != null ? u.getDepartment().getCode() : null,
                u.getRole() != null ? u.getRole().name() : "STUDENT"
        )).toList();
    }

    @Transactional(readOnly = true)
    public boolean isUserParticipant(Long conversationId, Long userId) {
        return participantRepository.existsByConversationIdAndUserId(conversationId, userId);
    }

    public MessageResponseDto mapToMessageDto(Message message) {
        User sender = message.getSender();
        String senderUsername = sender != null ? (sender.getUsername() != null ? sender.getUsername() : sender.getEmail()) : "Unknown";
        String senderName = sender != null ? (sender.getFullName() != null ? sender.getFullName() : senderUsername) : "Unknown";

        return new MessageResponseDto(
                message.getId(),
                message.getConversation() != null ? message.getConversation().getId() : null,
                sender != null ? sender.getId() : null,
                senderUsername,
                senderName,
                message.getContent(),
                message.getCreatedAt()
        );
    }

    private ConversationResponseDto mapToConversationDto(Conversation conversation, User currentUser) {
        List<ConversationParticipant> participants = participantRepository.findByConversationId(conversation.getId());
        
        User otherUser = participants.stream()
                .map(ConversationParticipant::getUser)
                .filter(u -> !Objects.equals(u.getId(), currentUser.getId()))
                .findFirst()
                .orElse(null);

        ParticipantSummaryDto otherParticipantDto = null;
        if (otherUser != null) {
            String deptCode = otherUser.getDepartment() != null ? otherUser.getDepartment().getCode() : null;
            otherParticipantDto = new ParticipantSummaryDto(
                    otherUser.getId(),
                    otherUser.getUsername() != null ? otherUser.getUsername() : otherUser.getEmail(),
                    otherUser.getFullName() != null ? otherUser.getFullName() : (otherUser.getUsername() != null ? otherUser.getUsername() : otherUser.getEmail()),
                    deptCode,
                    otherUser.getRole() != null ? otherUser.getRole().name() : "STUDENT"
            );
        }

        Optional<Message> latestMessage = messageRepository.findFirstByConversationIdOrderByCreatedAtDesc(conversation.getId());
        MessageResponseDto lastMessageDto = latestMessage.map(this::mapToMessageDto).orElse(null);

        return new ConversationResponseDto(
                conversation.getId(),
                otherParticipantDto,
                lastMessageDto,
                conversation.getCreatedAt(),
                conversation.getUpdatedAt()
        );
    }
}
