package com.campusnexus.config;

import com.campusnexus.entity.User;
import com.campusnexus.repository.UserRepository;
import com.campusnexus.repository.chat.ConversationParticipantRepository;
import com.campusnexus.security.CustomUserDetailsService;
import com.campusnexus.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(WebSocketAuthInterceptor.class);

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final ConversationParticipantRepository participantRepository;

    public WebSocketAuthInterceptor(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService,
            UserRepository userRepository,
            @Lazy ConversationParticipantRepository participantRepository
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.participantRepository = participantRepository;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {
            handleConnect(accessor);
        } else if (StompCommand.SUBSCRIBE.equals(command)) {
            handleSubscribe(accessor);
        }

        return message;
    }

    private void handleConnect(StompHeaderAccessor accessor) {
        String token = null;

        // Check Native Headers (Authorization: Bearer <token>)
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String header = authHeaders.get(0);
            if (header != null && header.startsWith("Bearer ")) {
                token = header.substring(7).trim();
            } else {
                token = header;
            }
        }

        // Check fallback "token" header or passcode
        if (token == null || token.isBlank()) {
            List<String> tokenHeaders = accessor.getNativeHeader("token");
            if (tokenHeaders != null && !tokenHeaders.isEmpty()) {
                token = tokenHeaders.get(0);
            } else if (accessor.getPasscode() != null && !accessor.getPasscode().isBlank()) {
                token = accessor.getPasscode();
            }
        }

        if (token == null || token.isBlank()) {
            log.warn("WebSocket CONNECT rejected: Missing authorization token");
            throw new AccessDeniedException("Missing authorization token for WebSocket connection.");
        }

        try {
            if (!jwtService.isTokenValid(token)) {
                log.warn("WebSocket CONNECT rejected: Invalid or expired JWT token");
                throw new AccessDeniedException("Invalid or expired JWT token.");
            }

            String email = jwtService.extractEmail(token);
            if (email == null || email.isBlank()) {
                throw new AccessDeniedException("Invalid JWT claims: missing subject email.");
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            if (!userDetails.isEnabled()) {
                throw new AccessDeniedException("User account is disabled.");
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            accessor.setUser(authentication);
            log.debug("WebSocket CONNECT authenticated for user: {}", email);
        } catch (Exception ex) {
            log.warn("WebSocket authentication failure: {}", ex.getMessage());
            throw new AccessDeniedException("WebSocket authentication failed: " + ex.getMessage());
        }
    }

    private void handleSubscribe(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null) {
            return;
        }

        if (destination.startsWith("/topic/conversations/")) {
            String conversationIdStr = destination.substring("/topic/conversations/".length());
            Long conversationId;
            try {
                conversationId = Long.parseLong(conversationIdStr);
            } catch (NumberFormatException e) {
                log.warn("Invalid conversation destination format: {}", destination);
                throw new AccessDeniedException("Invalid conversation destination: " + destination);
            }

            Authentication authentication = (Authentication) accessor.getUser();
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("Unauthorized subscription attempt to {}", destination);
                throw new AccessDeniedException("Unauthorized subscription: authentication required.");
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                throw new AccessDeniedException("Authenticated user not found.");
            }

            User user = userOpt.get();
            boolean isParticipant = participantRepository.existsByConversationIdAndUserId(conversationId, user.getId());
            if (!isParticipant) {
                log.warn("Access denied: User {} ({}) attempted to subscribe to unauthorized conversation {}", user.getId(), user.getEmail(), conversationId);
                throw new AccessDeniedException("You are not authorized to subscribe to conversation " + conversationId);
            }

            log.debug("Authorized subscription to conversation {} for user {}", conversationId, user.getEmail());
        }
    }
}
