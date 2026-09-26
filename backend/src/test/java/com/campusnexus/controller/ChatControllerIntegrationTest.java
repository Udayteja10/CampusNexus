package com.campusnexus.controller;

import com.campusnexus.dto.chat.DirectConversationRequest;
import com.campusnexus.dto.chat.SendMessageRequestDto;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.entity.chat.Conversation;
import com.campusnexus.entity.chat.ConversationParticipant;
import com.campusnexus.repository.UserRepository;
import com.campusnexus.repository.chat.ConversationParticipantRepository;
import com.campusnexus.repository.chat.ConversationRepository;
import com.campusnexus.repository.chat.MessageRepository;
import com.campusnexus.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ChatControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ConversationParticipantRepository participantRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private User student1;
    private User student2;
    private User student3;
    private String token1;
    private String token2;
    private String token3;

    @BeforeEach
    void setUp() {
        cleanUp();

        student1 = new User("chattest1@vnrvjiet.in", passwordEncoder.encode("Password@123"), Role.STUDENT);
        student1.setUsername("chattest1");
        student1.setFullName("Chat Test Student 1");
        student1.setEmailVerified(true);
        student1 = userRepository.save(student1);

        student2 = new User("chattest2@vnrvjiet.in", passwordEncoder.encode("Password@123"), Role.STUDENT);
        student2.setUsername("chattest2");
        student2.setFullName("Chat Test Student 2");
        student2.setEmailVerified(true);
        student2 = userRepository.save(student2);

        student3 = new User("chattest3@vnrvjiet.in", passwordEncoder.encode("Password@123"), Role.STUDENT);
        student3.setUsername("chattest3");
        student3.setFullName("Chat Test Student 3");
        student3.setEmailVerified(true);
        student3 = userRepository.save(student3);

        token1 = jwtService.generateToken(student1);
        token2 = jwtService.generateToken(student2);
        token3 = jwtService.generateToken(student3);
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        messageRepository.deleteAll();
        participantRepository.deleteAll();
        conversationRepository.deleteAll();

        userRepository.findByEmail("chattest1@vnrvjiet.in").ifPresent(userRepository::delete);
        userRepository.findByEmail("chattest2@vnrvjiet.in").ifPresent(userRepository::delete);
        userRepository.findByEmail("chattest3@vnrvjiet.in").ifPresent(userRepository::delete);
    }

    @Test
    @DisplayName("Unauthenticated request to chat API should be rejected with 401")
    void unauthenticatedAccessShouldFail() throws Exception {
        mockMvc.perform(get("/api/v1/chat/conversations"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Direct conversation creation and retrieval between student1 and student2")
    void createAndGetDirectConversation() throws Exception {
        DirectConversationRequest req = new DirectConversationRequest(student2.getId());

        mockMvc.perform(post("/api/v1/chat/conversations/direct")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.otherParticipant.id", is(student2.getId().intValue())))
                .andExpect(jsonPath("$.data.otherParticipant.username", is("chattest2")));

        // Calling again should return the same conversation
        mockMvc.perform(post("/api/v1/chat/conversations/direct")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.otherParticipant.id", is(student2.getId().intValue())));

        // Check user conversations list
        mockMvc.perform(get("/api/v1/chat/conversations")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    @DisplayName("Message exchange and access control between conversation participants and non-participants")
    void messageExchangeAndAccessControl() throws Exception {
        // 1. Create conversation between student1 and student2
        Conversation conv = new Conversation();
        conv.setCreatedAt(LocalDateTime.now());
        conv.setUpdatedAt(LocalDateTime.now());
        conv = conversationRepository.save(conv);

        ConversationParticipant p1 = new ConversationParticipant(conv, student1);
        p1.setJoinedAt(LocalDateTime.now());
        ConversationParticipant p2 = new ConversationParticipant(conv, student2);
        p2.setJoinedAt(LocalDateTime.now());
        participantRepository.save(p1);
        participantRepository.save(p2);

        Long convId = conv.getId();

        // 2. Student1 sends a message
        SendMessageRequestDto sendDto = new SendMessageRequestDto(convId, "Hey Student 2, how is the project going?");
        mockMvc.perform(post("/api/v1/chat/conversations/" + convId + "/messages")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sendDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", is("Hey Student 2, how is the project going?")))
                .andExpect(jsonPath("$.data.senderUsername", is("chattest1")));

        // 3. Student2 reads message history
        mockMvc.perform(get("/api/v1/chat/conversations/" + convId + "/messages")
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].content", is("Hey Student 2, how is the project going?")));

        // 4. Student3 (non-participant) tries to read message history -> 403 Forbidden
        mockMvc.perform(get("/api/v1/chat/conversations/" + convId + "/messages")
                        .header("Authorization", "Bearer " + token3))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)));

        // 5. Student3 tries to send message to convId -> 403 Forbidden
        SendMessageRequestDto maliciousSend = new SendMessageRequestDto(convId, "Intruder message!");
        mockMvc.perform(post("/api/v1/chat/conversations/" + convId + "/messages")
                        .header("Authorization", "Bearer " + token3)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(maliciousSend)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)));
    }
}
