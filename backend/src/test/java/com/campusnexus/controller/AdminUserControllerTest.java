package com.campusnexus.controller;

import com.campusnexus.dto.UpdateUserRoleRequest;
import com.campusnexus.dto.UpdateUserStatusRequest;
import com.campusnexus.entity.Department;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.UserRepository;
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
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private User adminUser;
    private User studentUser;
    private User newStudent;
    private String adminToken;
    private String studentToken;

    @BeforeEach
    void setUp() {
        Department csit = departmentRepository.findByCode("CSIT").orElseGet(() -> {
            Department d = new Department("CSIT", "Computer Science & Information Technology", "CSIT");
            return departmentRepository.save(d);
        });

        adminUser = userRepository.findByEmail("admin@mlrit.ac.in").orElseGet(() -> {
            User u = new User("admin@mlrit.ac.in", passwordEncoder.encode("Password@123"), Role.ADMIN);
            u.setUsername("admin_mlrit");
            u.setFullName("MLRIT Admin");
            return userRepository.save(u);
        });
        adminToken = jwtService.generateToken(adminUser);

        studentUser = userRepository.findByEmail("student@mlrit.ac.in").orElseGet(() -> {
            User u = new User("student@mlrit.ac.in", passwordEncoder.encode("Password@123"), Role.STUDENT);
            u.setUsername("student_mlrit");
            u.setFullName("MLRIT Student");
            u.setEmailVerified(true);
            return userRepository.save(u);
        });
        studentToken = jwtService.generateToken(studentUser);

        userRepository.findByEmail("23r21a3344_test@mlrit.ac.in").ifPresent(userRepository::delete);
        userRepository.findByUsernameIgnoreCase("udayteja_test").ifPresent(userRepository::delete);

        newStudent = new User(
                "23r21a3344_test@mlrit.ac.in",
                passwordEncoder.encode("Password@123"),
                Role.STUDENT,
                2023,
                "R21",
                4,
                csit,
                "23R21A3344_T"
        );
        newStudent.setUsername("udayteja_test");
        newStudent.setFullName("Uday Teja Test");
        newStudent.setEmailVerified(true);
        newStudent = userRepository.save(newStudent);
    }

    @AfterEach
    @Transactional
    void tearDown() {
        if (newStudent != null && newStudent.getId() != null) {
            userRepository.deleteById(newStudent.getId());
        }
    }

    @Test
    @DisplayName("ADMIN can retrieve paginated list of users including newly registered student")
    void shouldReturnAllUsersForAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("page", "0")
                        .param("size", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", not(empty())))
                .andExpect(jsonPath("$.data.content[*].username", hasItem("udayteja_test")))
                .andExpect(jsonPath("$.data.content[*].email", hasItem("23r21a3344_test@mlrit.ac.in")))
                .andExpect(jsonPath("$.data.content[*].htno", hasItem("23R21A3344_T")));
    }

    @Test
    @DisplayName("Unauthorized users (STUDENT role) cannot access admin user management")
    void shouldRejectNonAdminAccess() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/admin/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("ADMIN can search user by username")
    void shouldSearchByUsername() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("search", "udayteja_test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].username", is("udayteja_test")))
                .andExpect(jsonPath("$.data.content[0].email", is("23r21a3344_test@mlrit.ac.in")));
    }

    @Test
    @DisplayName("ADMIN can search user by institutional email")
    void shouldSearchByEmail() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("search", "23r21a3344_test@mlrit.ac.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].username", is("udayteja_test")));
    }

    @Test
    @DisplayName("ADMIN can search user by HTNO")
    void shouldSearchByHtno() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("search", "23R21A3344_T"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].htno", is("23R21A3344_T")));
    }

    @Test
    @DisplayName("ADMIN can filter users by role and status")
    void shouldFilterByRoleAndStatus() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("role", "STUDENT")
                        .param("status", "ACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[*].role", everyItem(is("STUDENT"))))
                .andExpect(jsonPath("$.data.content[*].enabled", everyItem(is(true))));
    }

    @Test
    @DisplayName("ADMIN can update user status (suspend and restore)")
    void shouldUpdateUserStatus() throws Exception {
        UpdateUserStatusRequest suspendReq = new UpdateUserStatusRequest("SUSPENDED", "Policy violation");
        mockMvc.perform(patch("/api/v1/admin/users/" + newStudent.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(suspendReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.enabled", is(false)));

        User suspendedInDb = userRepository.findById(newStudent.getId()).orElseThrow();
        assertThat(suspendedInDb.isEnabled()).isFalse();

        UpdateUserStatusRequest restoreReq = new UpdateUserStatusRequest("ACTIVE", "Restored after appeal");
        mockMvc.perform(patch("/api/v1/admin/users/" + newStudent.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(restoreReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.enabled", is(true)));

        User restoredInDb = userRepository.findById(newStudent.getId()).orElseThrow();
        assertThat(restoredInDb.isEnabled()).isTrue();
    }

    @Test
    @DisplayName("ADMIN can update user role")
    void shouldUpdateUserRole() throws Exception {
        UpdateUserRoleRequest roleReq = new UpdateUserRoleRequest(Role.MODERATOR);
        mockMvc.perform(patch("/api/v1/admin/users/" + newStudent.getId() + "/role")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(roleReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role", is("MODERATOR")));

        User updatedInDb = userRepository.findById(newStudent.getId()).orElseThrow();
        assertThat(updatedInDb.getRole()).isEqualTo(Role.MODERATOR);
    }
}
