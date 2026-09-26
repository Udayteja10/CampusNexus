package com.campusnexus.controller;

import com.campusnexus.dto.AssignCoordinatorRequest;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminStudentCoordinatorIntegrationTest {

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

    private static final String ADMIN_EMAIL = "admin.api.test@campusnexus.com";
    private static final String MODERATOR_EMAIL = "mod.api.test@campusnexus.com";
    private static final String STUDENT_EMAIL = "student.api.test@campusnexus.com";

    private String adminToken;
    private String moderatorToken;
    private String studentToken;

    private User adminUser;
    private User moderatorUser;
    private User studentUser;
    private Department cseDept;
    private Department eceDept;

    @BeforeEach
    void setUp() {
        cleanUp();

        cseDept = departmentRepository.findByCode("CSE").orElseThrow();
        eceDept = departmentRepository.findByCode("ECE").orElseThrow();

        adminUser = new User(ADMIN_EMAIL, passwordEncoder.encode("Password@123"), Role.ADMIN);
        adminUser = userRepository.save(adminUser);
        adminToken = jwtService.generateToken(adminUser);

        moderatorUser = new User(MODERATOR_EMAIL, passwordEncoder.encode("Password@123"), Role.MODERATOR);
        moderatorUser = userRepository.save(moderatorUser);
        moderatorToken = jwtService.generateToken(moderatorUser);

        studentUser = new User(STUDENT_EMAIL, passwordEncoder.encode("Password@123"), Role.STUDENT, 2023, "R21", 4, cseDept, "23R21A0201");
        studentUser = userRepository.save(studentUser);
        studentToken = jwtService.generateToken(studentUser);
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        userRepository.findByEmail(ADMIN_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(MODERATOR_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(STUDENT_EMAIL).ifPresent(userRepository::delete);
    }

    @Test
    @DisplayName("Anonymous request to admin student-coordinators endpoint should return 401 Unauthorized")
    void shouldRejectAnonymousRequest() throws Exception {
        AssignCoordinatorRequest request = new AssignCoordinatorRequest(studentUser.getId(), cseDept.getId());

        mockMvc.perform(post("/api/v1/admin/student-coordinators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("STUDENT role request to admin student-coordinators endpoint should return 403 Forbidden")
    void shouldRejectStudentRequest() throws Exception {
        AssignCoordinatorRequest request = new AssignCoordinatorRequest(studentUser.getId(), cseDept.getId());

        mockMvc.perform(post("/api/v1/admin/student-coordinators")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("MODERATOR role request to admin student-coordinators endpoint should return 403 Forbidden")
    void shouldRejectModeratorRequest() throws Exception {
        AssignCoordinatorRequest request = new AssignCoordinatorRequest(studentUser.getId(), cseDept.getId());

        mockMvc.perform(post("/api/v1/admin/student-coordinators")
                        .header("Authorization", "Bearer " + moderatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("ADMIN role request should successfully assign, lookup, and remove student coordinator")
    void shouldManageStudentCoordinatorLifecycleAsAdmin() throws Exception {
        AssignCoordinatorRequest assignRequest = new AssignCoordinatorRequest(studentUser.getId(), cseDept.getId());

        // 1. Assign Coordinator
        mockMvc.perform(post("/api/v1/admin/student-coordinators")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is(STUDENT_EMAIL)))
                .andExpect(jsonPath("$.data.role", is("STUDENT")))
                .andExpect(jsonPath("$.data.department", is("CSE")))
                .andExpect(jsonPath("$.data.coordinatorDepartment", is("CSE")))
                .andExpect(jsonPath("$.data.htno", is("23R21A0201")))
                .andExpect(jsonPath("$.data.password").doesNotExist())
                .andExpect(jsonPath("$.data.passwordHash").doesNotExist());

        // 2. Lookup Coordinator by Department
        mockMvc.perform(get("/api/v1/admin/student-coordinators/department/" + cseDept.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is(STUDENT_EMAIL)))
                .andExpect(jsonPath("$.data.coordinatorDepartment", is("CSE")));

        // 3. Remove Coordinator
        mockMvc.perform(delete("/api/v1/admin/student-coordinators/" + studentUser.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.coordinatorDepartment", nullValue()))
                .andExpect(jsonPath("$.data.department", is("CSE")))
                .andExpect(jsonPath("$.data.role", is("STUDENT")));

        // Verify entity state in database
        User reloaded = userRepository.findById(studentUser.getId()).orElseThrow();
        assertThat(reloaded.getCoordinatorDepartment()).isNull();
        assertThat(reloaded.getDepartment()).isNotNull();
        assertThat(reloaded.getDepartment().getId()).isEqualTo(cseDept.getId());
        assertThat(reloaded.getRole()).isEqualTo(Role.STUDENT);
    }

    @Test
    @DisplayName("ADMIN assignment should reject cross-department assignment with 400 Bad Request")
    void shouldRejectCrossDepartmentAssignment() throws Exception {
        // student is CSE, attempting ECE coordinator assignment
        AssignCoordinatorRequest crossDeptRequest = new AssignCoordinatorRequest(studentUser.getId(), eceDept.getId());

        mockMvc.perform(post("/api/v1/admin/student-coordinators")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crossDeptRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("ADMIN assignment should reject non-existent user with 404 Not Found")
    void shouldReturn404ForNonExistentUser() throws Exception {
        AssignCoordinatorRequest request = new AssignCoordinatorRequest(999999L, cseDept.getId());

        mockMvc.perform(post("/api/v1/admin/student-coordinators")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)));
    }
}
