package com.campusnexus.controller;

import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.repository.UserRepository;
import com.campusnexus.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminSmtpControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private String adminToken;
    private String studentToken;

    @BeforeEach
    @Transactional
    void setUp() {
        User admin = userRepository.findByEmail("admin@mlrit.ac.in").orElseGet(() -> {
            User u = new User("admin@mlrit.ac.in", passwordEncoder.encode("Password@123"), Role.ADMIN);
            return userRepository.save(u);
        });
        adminToken = jwtService.generateToken(admin);

        User student = userRepository.findByEmail("student@mlrit.ac.in").orElseGet(() -> {
            User u = new User("student@mlrit.ac.in", passwordEncoder.encode("Password@123"), Role.STUDENT);
            u.setEmailVerified(true);
            return userRepository.save(u);
        });
        studentToken = jwtService.generateToken(student);
    }

    @Test
    @DisplayName("GET /api/v1/admin/smtp-status should allow ADMIN and return safe metadata")
    void shouldAllowAdminToGetSmtpStatus() throws Exception {
        mockMvc.perform(get("/api/v1/admin/smtp-status")
                        .header("Authorization", "Bearer " + adminToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("SMTP status retrieved successfully")))
                .andExpect(jsonPath("$.data.host").exists())
                .andExpect(jsonPath("$.data.port").isNumber())
                .andExpect(jsonPath("$.data.fromAddress").exists());
    }

    @Test
    @DisplayName("GET /api/v1/admin/smtp-status should reject STUDENT with 403 Forbidden")
    void shouldRejectStudentFromSmtpStatus() throws Exception {
        mockMvc.perform(get("/api/v1/admin/smtp-status")
                        .header("Authorization", "Bearer " + studentToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/admin/smtp-status should reject unauthenticated request with 401 Unauthorized")
    void shouldRejectUnauthenticatedRequest() throws Exception {
        mockMvc.perform(get("/api/v1/admin/smtp-status")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
