package com.campusnexus.service;

import com.campusnexus.dto.chat.ConversationResponseDto;
import com.campusnexus.dto.chat.MessageResponseDto;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.entity.chat.Conversation;
import com.campusnexus.entity.chat.ConversationParticipant;
import com.campusnexus.entity.chat.Message;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.UserRepository;
import com.campusnexus.repository.chat.ConversationParticipantRepository;
import com.campusnexus.repository.chat.ConversationRepository;
import com.campusnexus.repository.chat.MessageRepository;
import com.campusnexus.service.chat.ChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private ConversationParticipantRepository participantRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SimpMessageSendingOperations messagingTemplate;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private ChatService chatService;

    private User userA;
    private User userB;
    private User userC;

    @BeforeEach
    void setUp() {
        userA = new User("studentA@vnrvjiet.in", "hash1", Role.STUDENT);
        userA.setId(1L);
        userA.setUsername("student_a");
        userA.setFullName("Student A");

        userB = new User("studentB@vnrvjiet.in", "hash2", Role.STUDENT);
        userB.setId(2L);
        userB.setUsername("student_b");
        userB.setFullName("Student B");

        userC = new User("studentC@vnrvjiet.in", "hash3", Role.STUDENT);
        userC.setId(3L);
        userC.setUsername("student_c");
        userC.setFullName("Student C");
    }

    @Nested
    @DisplayName("Direct Conversation Tests")
    class DirectConversationTests {

        @Test
        @DisplayName("Should create new direct conversation when none exists")
        void shouldCreateNewConversation() {
            when(userRepository.findById(2L)).thenReturn(Optional.of(userB));
            when(conversationRepository.findDirectConversationBetweenUsers(1L, 2L)).thenReturn(Optional.empty());

            Conversation savedConv = new Conversation();
            savedConv.setId(10L);
            savedConv.setCreatedAt(LocalDateTime.now());
            savedConv.setUpdatedAt(LocalDateTime.now());

            when(conversationRepository.save(any(Conversation.class))).thenReturn(savedConv);

            ConversationParticipant cp1 = new ConversationParticipant(savedConv, userA);
            ConversationParticipant cp2 = new ConversationParticipant(savedConv, userB);
            when(participantRepository.findByConversationId(10L)).thenReturn(List.of(cp1, cp2));
            when(messageRepository.findFirstByConversationIdOrderByCreatedAtDesc(10L)).thenReturn(Optional.empty());

            ConversationResponseDto result = chatService.createOrGetDirectConversation(userA, 2L);

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(10L);
            assertThat(result.otherParticipant()).isNotNull();
            assertThat(result.otherParticipant().id()).isEqualTo(2L);
            assertThat(result.otherParticipant().username()).isEqualTo("student_b");
            verify(conversationRepository).save(any(Conversation.class));
            verify(participantRepository).save(cp1);
            verify(participantRepository).save(cp2);
        }

        @Test
        @DisplayName("Should reuse existing direct conversation without duplicate creation")
        void shouldReuseExistingConversation() {
            when(userRepository.findById(2L)).thenReturn(Optional.of(userB));

            Conversation existingConv = new Conversation();
            existingConv.setId(10L);
            existingConv.setCreatedAt(LocalDateTime.now().minusHours(1));
            existingConv.setUpdatedAt(LocalDateTime.now().minusMinutes(10));

            when(conversationRepository.findDirectConversationBetweenUsers(1L, 2L)).thenReturn(Optional.of(existingConv));

            ConversationParticipant cp1 = new ConversationParticipant(existingConv, userA);
            ConversationParticipant cp2 = new ConversationParticipant(existingConv, userB);
            when(participantRepository.findByConversationId(10L)).thenReturn(List.of(cp1, cp2));
            when(messageRepository.findFirstByConversationIdOrderByCreatedAtDesc(10L)).thenReturn(Optional.empty());

            ConversationResponseDto result = chatService.createOrGetDirectConversation(userA, 2L);

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(10L);
            verify(conversationRepository, never()).save(any(Conversation.class));
            verify(participantRepository, never()).save(any(ConversationParticipant.class));
        }

        @Test
        @DisplayName("Should reject conversation with self")
        void shouldRejectSelfConversation() {
            assertThatThrownBy(() -> chatService.createOrGetDirectConversation(userA, 1L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Cannot create a conversation with yourself");
        }

        @Test
        @DisplayName("Should reject conversation with non-existent user")
        void shouldRejectNonExistentRecipient() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> chatService.createOrGetDirectConversation(userA, 999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Recipient user not found");
        }
    }

    @Nested
    @DisplayName("Message Authorization and Persistence Tests")
    class MessageTests {

        @Test
        @DisplayName("Should persist and broadcast message when sender is participant")
        void shouldSendMessageSuccessfully() {
            Conversation conv = new Conversation();
            conv.setId(10L);
            conv.setCreatedAt(LocalDateTime.now());
            conv.setUpdatedAt(LocalDateTime.now());

            when(conversationRepository.findById(10L)).thenReturn(Optional.of(conv));
            when(participantRepository.existsByConversationIdAndUserId(10L, 1L)).thenReturn(true);

            Message savedMessage = new Message(conv, userA, "Hello Student B!");
            savedMessage.setId(101L);
            savedMessage.setCreatedAt(LocalDateTime.now());
            when(messageRepository.save(any(Message.class))).thenReturn(savedMessage);

            MessageResponseDto response = chatService.sendMessage(userA, 10L, "  Hello Student B!  ");

            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(101L);
            assertThat(response.content()).isEqualTo("Hello Student B!");
            assertThat(response.senderId()).isEqualTo(1L);
            assertThat(response.senderUsername()).isEqualTo("student_a");

            verify(messageRepository).save(any(Message.class));
            verify(messagingTemplate).convertAndSend(eq("/topic/conversations/10"), any(MessageResponseDto.class));
        }

        @Test
        @DisplayName("Should reject message sending if user is not participant in conversation")
        void shouldRejectSendingIfNotParticipant() {
            Conversation conv = new Conversation();
            conv.setId(10L);

            when(conversationRepository.findById(10L)).thenReturn(Optional.of(conv));
            when(participantRepository.existsByConversationIdAndUserId(10L, 3L)).thenReturn(false);

            assertThatThrownBy(() -> chatService.sendMessage(userC, 10L, "Sneaky message"))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("not a participant");

            verify(messageRepository, never()).save(any(Message.class));
            verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
        }

        @Test
        @DisplayName("Should reject empty or blank message content")
        void shouldRejectEmptyMessage() {
            assertThatThrownBy(() -> chatService.sendMessage(userA, 10L, "   "))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("blank");
        }

        @Test
        @DisplayName("Should reject excessively long message content")
        void shouldRejectOversizedMessage() {
            String longContent = "A".repeat(2001);
            assertThatThrownBy(() -> chatService.sendMessage(userA, 10L, longContent))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("2000 characters");
        }
    }

    @Nested
    @DisplayName("Message History Authorization Tests")
    class MessageHistoryTests {

        @Test
        @DisplayName("Should return message history for valid participant")
        void shouldReturnMessagesForParticipant() {
            when(conversationRepository.existsById(10L)).thenReturn(true);
            when(participantRepository.existsByConversationIdAndUserId(10L, 1L)).thenReturn(true);

            Conversation conv = new Conversation();
            conv.setId(10L);

            Message m1 = new Message(conv, userA, "Msg 1");
            m1.setId(1L);
            m1.setCreatedAt(LocalDateTime.now().minusMinutes(5));

            Message m2 = new Message(conv, userB, "Msg 2");
            m2.setId(2L);
            m2.setCreatedAt(LocalDateTime.now().minusMinutes(4));

            Pageable pageable = PageRequest.of(0, 50);
            Page<Message> messagePage = new PageImpl<>(List.of(m1, m2), pageable, 2);

            when(messageRepository.findByConversationIdOrderByCreatedAtAsc(10L, pageable)).thenReturn(messagePage);

            Page<MessageResponseDto> result = chatService.getConversationMessages(userA, 10L, pageable);

            assertThat(result).isNotNull();
            assertThat(result.getTotalElements()).isEqualTo(2);
            assertThat(result.getContent().get(0).content()).isEqualTo("Msg 1");
            assertThat(result.getContent().get(1).content()).isEqualTo("Msg 2");
        }

        @Test
        @DisplayName("Should reject message history request from non-participant")
        void shouldRejectHistoryForNonParticipant() {
            when(conversationRepository.existsById(10L)).thenReturn(true);
            when(participantRepository.existsByConversationIdAndUserId(10L, 3L)).thenReturn(false);

            Pageable pageable = PageRequest.of(0, 50);

            assertThatThrownBy(() -> chatService.getConversationMessages(userC, 10L, pageable))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("not a participant");
        }
    }
}
