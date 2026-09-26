package com.campusnexus.security;

import com.campusnexus.entity.Department;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.UserRepository;
import com.campusnexus.service.StudentCoordinatorService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.stereotype.Service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Import(MethodSecurityAuthorizationTest.TestConfig.class)
class MethodSecurityAuthorizationTest {

    @TestConfiguration
    static class TestConfig {
        @Bean
        public ProtectedTestService protectedTestService() {
            return new ProtectedTestService();
        }
    }

    @Service
    static class ProtectedTestService {

        @PreAuthorize("@authorizationService.isStudent(authentication)")
        public String studentAction() {
            return "STUDENT_SUCCESS";
        }

        @PreAuthorize("@authorizationService.isModerator(authentication)")
        public String moderatorAction() {
            return "MODERATOR_SUCCESS";
        }

        @PreAuthorize("@authorizationService.isStudentCoordinator(authentication)")
        public String coordinatorAction() {
            return "COORDINATOR_SUCCESS";
        }

        @PreAuthorize("@authorizationService.isCoordinatorForDepartment(authentication, #departmentId)")
        public String departmentScopedByIdAction(Long departmentId) {
            return "DEPT_BY_ID_SUCCESS";
        }

        @PreAuthorize("@authorizationService.isCoordinatorForDepartment(authentication, #departmentCode)")
        public String departmentScopedByCodeAction(String departmentCode) {
            return "DEPT_BY_CODE_SUCCESS";
        }

        @PreAuthorize("@authorizationService.isInUserDepartment(authentication, #departmentId)")
        public String userDepartmentScopedByIdAction(Long departmentId) {
            return "USER_DEPT_BY_ID_SUCCESS";
        }

        @PreAuthorize("@authorizationService.isInUserDepartment(authentication, #departmentCode)")
        public String userDepartmentScopedByCodeAction(String departmentCode) {
            return "USER_DEPT_BY_CODE_SUCCESS";
        }

        @PreAuthorize("hasRole('ADMIN')")
        public String adminAction() {
            return "ADMIN_SUCCESS";
        }
    }

    @Autowired
    private ProtectedTestService protectedTestService;

    @Autowired
    private StudentCoordinatorService studentCoordinatorService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    private static final String STUDENT_EMAIL = "method.sec.student@campusnexus.com";
    private static final String COORD_EMAIL = "method.sec.coord@campusnexus.com";
    private static final String MOD_EMAIL = "method.sec.mod@campusnexus.com";
    private static final String ADMIN_EMAIL = "method.sec.admin@campusnexus.com";
    private static final String NO_DEPT_EMAIL = "method.sec.nodept@campusnexus.com";

    private Department cseDept;
    private Department eceDept;

    private User studentUser;
    private User coordUser;
    private User modUser;
    private User adminUser;
    private User noDeptUser;

    @BeforeEach
    void setUp() {
        cleanUp();

        cseDept = departmentRepository.findByCode("CSE").orElseThrow();
        eceDept = departmentRepository.findByCode("ECE").orElseThrow();

        studentUser = new User(STUDENT_EMAIL, "$2a$10$dummyHash", Role.STUDENT, 2023, "R21", 4, cseDept, "23R21A0290");
        studentUser = userRepository.save(studentUser);

        coordUser = new User(COORD_EMAIL, "$2a$10$dummyHash", Role.STUDENT, 2023, "R21", 4, cseDept, "23R21A0291", cseDept);
        coordUser = userRepository.save(coordUser);

        modUser = new User(MOD_EMAIL, "$2a$10$dummyHash", Role.MODERATOR);
        modUser = userRepository.save(modUser);

        adminUser = new User(ADMIN_EMAIL, "$2a$10$dummyHash", Role.ADMIN);
        adminUser = userRepository.save(adminUser);

        noDeptUser = new User(NO_DEPT_EMAIL, "$2a$10$dummyHash", Role.STUDENT);
        noDeptUser = userRepository.save(noDeptUser);
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        userRepository.findByEmail(STUDENT_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(COORD_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(MOD_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(ADMIN_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(NO_DEPT_EMAIL).ifPresent(userRepository::delete);
    }

    @Test
    @WithMockUser(username = STUDENT_EMAIL, roles = {"STUDENT"})
    @DisplayName("Normal student can invoke student-guarded method but is rejected from coordinator, moderator, and admin methods")
    void shouldAuthorizeNormalStudentInMethodSecurity() {
        assertThat(protectedTestService.studentAction()).isEqualTo("STUDENT_SUCCESS");

        // Department isolation: own department allowed
        assertThat(protectedTestService.userDepartmentScopedByIdAction(cseDept.getId())).isEqualTo("USER_DEPT_BY_ID_SUCCESS");
        assertThat(protectedTestService.userDepartmentScopedByCodeAction("CSE")).isEqualTo("USER_DEPT_BY_CODE_SUCCESS");
        assertThat(protectedTestService.userDepartmentScopedByCodeAction("cse")).isEqualTo("USER_DEPT_BY_CODE_SUCCESS");

        // Department isolation: other department denied
        assertThatThrownBy(() -> protectedTestService.userDepartmentScopedByIdAction(eceDept.getId()))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> protectedTestService.userDepartmentScopedByCodeAction("ECE"))
                .isInstanceOf(AccessDeniedException.class);

        // Coordinator action denied for normal student
        assertThatThrownBy(() -> protectedTestService.coordinatorAction())
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> protectedTestService.departmentScopedByIdAction(cseDept.getId()))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> protectedTestService.departmentScopedByCodeAction("CSE"))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> protectedTestService.moderatorAction())
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> protectedTestService.adminAction())
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @WithMockUser(username = COORD_EMAIL, roles = {"STUDENT"})
    @DisplayName("Student coordinator can invoke student, coordinator, and matching department methods, but is rejected from other departments, moderator, and admin")
    void shouldAuthorizeStudentCoordinatorInMethodSecurity() {
        assertThat(protectedTestService.studentAction()).isEqualTo("STUDENT_SUCCESS");
        assertThat(protectedTestService.coordinatorAction()).isEqualTo("COORDINATOR_SUCCESS");
        assertThat(protectedTestService.departmentScopedByIdAction(cseDept.getId())).isEqualTo("DEPT_BY_ID_SUCCESS");
        assertThat(protectedTestService.departmentScopedByCodeAction("CSE")).isEqualTo("DEPT_BY_CODE_SUCCESS");
        assertThat(protectedTestService.departmentScopedByCodeAction("cse")).isEqualTo("DEPT_BY_CODE_SUCCESS");

        // Academic department isolation check
        assertThat(protectedTestService.userDepartmentScopedByIdAction(cseDept.getId())).isEqualTo("USER_DEPT_BY_ID_SUCCESS");
        assertThat(protectedTestService.userDepartmentScopedByCodeAction("CSE")).isEqualTo("USER_DEPT_BY_CODE_SUCCESS");

        // Rejected from other department in coordinator scope
        assertThatThrownBy(() -> protectedTestService.departmentScopedByIdAction(eceDept.getId()))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> protectedTestService.departmentScopedByCodeAction("ECE"))
                .isInstanceOf(AccessDeniedException.class);

        // Rejected from other department in user academic isolation scope
        assertThatThrownBy(() -> protectedTestService.userDepartmentScopedByIdAction(eceDept.getId()))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> protectedTestService.userDepartmentScopedByCodeAction("ECE"))
                .isInstanceOf(AccessDeniedException.class);

        // Rejected from moderator and admin
        assertThatThrownBy(() -> protectedTestService.moderatorAction())
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> protectedTestService.adminAction())
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @WithMockUser(username = NO_DEPT_EMAIL, roles = {"STUDENT"})
    @DisplayName("Student without department should be rejected from department-isolated methods")
    void shouldRejectStudentWithoutDepartmentFromDepartmentScopedMethods() {
        assertThat(protectedTestService.studentAction()).isEqualTo("STUDENT_SUCCESS");

        assertThatThrownBy(() -> protectedTestService.userDepartmentScopedByIdAction(cseDept.getId()))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> protectedTestService.userDepartmentScopedByCodeAction("CSE"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @WithMockUser(username = MOD_EMAIL, roles = {"MODERATOR"})
    @DisplayName("Moderator can invoke moderator method but is rejected from student coordinator and admin methods")
    void shouldAuthorizeModeratorInMethodSecurity() {
        assertThat(protectedTestService.moderatorAction()).isEqualTo("MODERATOR_SUCCESS");

        assertThatThrownBy(() -> protectedTestService.userDepartmentScopedByIdAction(cseDept.getId()))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> protectedTestService.coordinatorAction())
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> protectedTestService.departmentScopedByIdAction(cseDept.getId()))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> protectedTestService.adminAction())
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = {"ADMIN"})
    @DisplayName("Admin can invoke admin method and manage student coordinators")
    void shouldAuthorizeAdminInMethodSecurity() {
        assertThat(protectedTestService.adminAction()).isEqualTo("ADMIN_SUCCESS");

        assertThatThrownBy(() -> protectedTestService.userDepartmentScopedByIdAction(cseDept.getId()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @WithMockUser(username = COORD_EMAIL, roles = {"STUDENT"})
    @DisplayName("Student coordinator cannot self-escalate or assign/remove coordinator permissions")
    void shouldPreventCoordinatorSelfEscalation() {
        assertThatThrownBy(() -> studentCoordinatorService.assignCoordinator(studentUser.getId(), cseDept.getId()))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> studentCoordinatorService.removeCoordinator(coordUser.getId()))
                .isInstanceOf(AccessDeniedException.class);
    }
}
