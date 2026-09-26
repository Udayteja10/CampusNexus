package com.campusnexus.security;

import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class JwtServiceTest {

    @Autowired
    private JwtService jwtService;

    @Test
    @DisplayName("Should generate a valid JWT with subject, userId, and role claims")
    void shouldGenerateAndExtractTokenClaims() {
        User user = new User("jwt.test@campusnexus.com", "hashed_pwd", Role.STUDENT);
        user.setId(100L);

        String token = jwtService.generateToken(user);
        assertThat(token).isNotBlank();

        assertThat(jwtService.extractEmail(token)).isEqualTo("jwt.test@campusnexus.com");
        assertThat(jwtService.extractUserId(token)).isEqualTo(100L);
        assertThat(jwtService.extractRole(token)).isEqualTo("STUDENT");
        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    @DisplayName("Should reject a tampered JWT token")
    void shouldRejectTamperedToken() {
        User user = new User("tamper.test@campusnexus.com", "hashed_pwd", Role.MODERATOR);
        user.setId(200L);

        String token = jwtService.generateToken(user);
        String tamperedToken = token.substring(0, token.length() - 5) + "abcde";

        assertThat(jwtService.isTokenValid(tamperedToken)).isFalse();
    }

    @Test
    @DisplayName("Should reject a malformed JWT token")
    void shouldRejectMalformedToken() {
        assertThat(jwtService.isTokenValid("not.a.valid.jwt.token")).isFalse();
        assertThat(jwtService.isTokenValid("")).isFalse();
    }

    @Test
    @DisplayName("Should reject an expired JWT token")
    void shouldRejectExpiredToken() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", 300L);
        claims.put("role", "ADMIN");

        // Expired 10 seconds ago
        Date expiredDate = new Date(System.currentTimeMillis() - 10000);
        Date issuedAt = new Date(System.currentTimeMillis() - 20000);

        String expiredToken = io.jsonwebtoken.Jwts.builder()
                .claims(claims)
                .subject("expired@campusnexus.com")
                .issuedAt(issuedAt)
                .expiration(expiredDate)
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                        java.util.Arrays.copyOf(
                                "this-is-a-secure-256-bit-test-key-for-campusnexus".getBytes(java.nio.charset.StandardCharsets.UTF_8),
                                32
                        )
                ))
                .compact();

        assertThat(jwtService.isTokenValid(expiredToken)).isFalse();
    }
}
