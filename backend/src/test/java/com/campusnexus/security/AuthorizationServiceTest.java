package com.campusnexus.security;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.campusnexus.entity.Department;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.UserRepository;

@SpringBootTest
class AuthorizationServiceTest {

    @Autowired
    private AuthorizationService authorizationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    private static final String STUDENT_EMAIL = "auth.test.student@campusnexus.com";
    private static final String COORD_EMAIL = "auth.test.coord@campusnexus.com";
    private static final String MOD_EMAIL = "auth.test.mod@campusnexus.com";
    private static final String ADMIN_EMAIL = "auth.test.admin@campusnexus.com";
    private static final String DISABLED_EMAIL = "auth.test.disabled@campusnexus.com";

    private Department cseDept;
    private Department eceDept;

    private User normalStudent;
    private User coordinatorStudent;
    private User moderatorUser;
    private User adminUser;
    private User disabledUser;

    @BeforeEach
    void setUp() {
        cleanUp();  

        cseDept = departmentRepository.findByCode("CSE").orElseThrow();
        eceDept = departmentRepository.findByCode("ECE").orElseThrow();

        // 1. Normal Student
        normalStudent = new User(STUDENT_EMAIL, "$2a$10$dummyHash", Role.STUDENT, 2023, "R21", 4, cseDept, "23R21A0299");
        normalStudent = userRepository.save(normalStudent);

        // 2. Student Coordinator for CSE
        coordinatorStudent = new User(COORD_EMAIL, "$2a$10$dummyHash", Role.STUDENT, 2023, "R21", 4, cseDept, "23R21A0201", cseDept);
        coordinatorStudent = userRepository.save(coordinatorStudent);

        // 3. Moderator
        moderatorUser = new User(MOD_EMAIL, "$2a$10$dummyHash", Role.MODERATOR);
        moderatorUser = userRepository.save(moderatorUser);

        // 4. Admin
        adminUser = new User(ADMIN_EMAIL, "$2a$10$dummyHash", Role.ADMIN);
        adminUser = userRepository.save(adminUser);

        // 5. Disabled Coordinator (ECE)
        disabledUser = new User(DISABLED_EMAIL, "$2a$10$dummyHash", Role.STUDENT, 2024, "R25", 3, eceDept, "24R25A0488", eceDept);
        disabledUser.setEnabled(false);
        disabledUser = userRepository.save(disabledUser);
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
        userRepository.findByEmail(DISABLED_EMAIL).ifPresent(userRepository::delete);
    }

    private Authentication createAuth(User user) {
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                user.isEnabled(),
                true,
                true,
                true,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    @Test
    @DisplayName("Normal student without coordinator department should be identified as student but NOT coordinator")
    void shouldEvaluateNormalStudentCorrectly() {
        Authentication auth = createAuth(normalStudent);

        assertThat(authorizationService.isStudent(auth)).isTrue();
        assertThat(authorizationService.isModerator(auth)).isFalse();
        assertThat(authorizationService.isAdmin(auth)).isFalse();
        assertThat(authorizationService.isStudentCoordinator(auth)).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, cseDept.getId())).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, "CSE")).isFalse();

        // Entity checks
        assertThat(authorizationService.isStudent(normalStudent)).isTrue();
        assertThat(authorizationService.isStudentCoordinator(normalStudent)).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(normalStudent, cseDept.getId())).isFalse();
    }

    @Test
    @DisplayName("Student coordinator should evaluate true for own department and false for other departments")
    void shouldEvaluateStudentCoordinatorDepartmentScope() {
        Authentication auth = createAuth(coordinatorStudent);

        assertThat(authorizationService.isStudent(auth)).isTrue();
        assertThat(authorizationService.isModerator(auth)).isFalse();
        assertThat(authorizationService.isAdmin(auth)).isFalse();
        assertThat(authorizationService.isStudentCoordinator(auth)).isTrue();

        // Department ID checks
        assertThat(authorizationService.isCoordinatorForDepartment(auth, cseDept.getId())).isTrue();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, eceDept.getId())).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, (Long) null)).isFalse();

        // Entity checks
        assertThat(authorizationService.isStudentCoordinator(coordinatorStudent)).isTrue();
        assertThat(authorizationService.isCoordinatorForDepartment(coordinatorStudent, cseDept.getId())).isTrue();
        assertThat(authorizationService.isCoordinatorForDepartment(coordinatorStudent, eceDept.getId())).isFalse();
    }

    @Test
    @DisplayName("Coordinator department code matching should be case-insensitive and reject invalid codes")
    void shouldEvaluateCoordinatorDepartmentCodeCaseInsensitively() {
        Authentication auth = createAuth(coordinatorStudent);

        assertThat(authorizationService.isCoordinatorForDepartment(auth, "CSE")).isTrue();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, "cse")).isTrue();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, "Cse")).isTrue();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, "ECE")).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, "NON_EXISTENT")).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, (String) null)).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, "   ")).isFalse();

        // Entity checks
        assertThat(authorizationService.isCoordinatorForDepartment(coordinatorStudent, "CSE")).isTrue();
        assertThat(authorizationService.isCoordinatorForDepartment(coordinatorStudent, "cse")).isTrue();
        assertThat(authorizationService.isCoordinatorForDepartment(coordinatorStudent, "ECE")).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(coordinatorStudent, (String) null)).isFalse();
    }

    @Test
    @DisplayName("MODERATOR authority should be global and not satisfy coordinator checks")
    void shouldEvaluateModeratorCorrectly() {
        Authentication auth = createAuth(moderatorUser);

        assertThat(authorizationService.isModerator(auth)).isTrue();
        assertThat(authorizationService.isStudent(auth)).isFalse();
        assertThat(authorizationService.isAdmin(auth)).isFalse();
        assertThat(authorizationService.isStudentCoordinator(auth)).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, cseDept.getId())).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, "CSE")).isFalse();

        // Entity checks
        assertThat(authorizationService.isModerator(moderatorUser)).isTrue();
        assertThat(authorizationService.isStudent(moderatorUser)).isFalse();
        assertThat(authorizationService.isStudentCoordinator(moderatorUser)).isFalse();
    }

    @Test
    @DisplayName("ADMIN authority should evaluate true for admin and false for coordinator checks")
    void shouldEvaluateAdminCorrectly() {
        Authentication auth = createAuth(adminUser);

        assertThat(authorizationService.isAdmin(auth)).isTrue();
        assertThat(authorizationService.isStudent(auth)).isFalse();
        assertThat(authorizationService.isModerator(auth)).isFalse();
        assertThat(authorizationService.isStudentCoordinator(auth)).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, cseDept.getId())).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, "CSE")).isFalse();

        // Entity checks
        assertThat(authorizationService.isAdmin(adminUser)).isTrue();
        assertThat(authorizationService.isStudentCoordinator(adminUser)).isFalse();
    }

    @Test
    @DisplayName("Anonymous, null, or unauthenticated contexts should fail closed and return false")
    void shouldFailClosedForUnauthenticatedOrNullContexts() {
        assertThat(authorizationService.isStudent((Authentication) null)).isFalse();
        assertThat(authorizationService.isModerator((Authentication) null)).isFalse();
        assertThat(authorizationService.isAdmin((Authentication) null)).isFalse();
        assertThat(authorizationService.isStudentCoordinator((Authentication) null)).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment((Authentication) null, cseDept.getId())).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment((Authentication) null, "CSE")).isFalse();

        // Entity null checks
        assertThat(authorizationService.isStudent((User) null)).isFalse();
        assertThat(authorizationService.isModerator((User) null)).isFalse();
        assertThat(authorizationService.isAdmin((User) null)).isFalse();
        assertThat(authorizationService.isStudentCoordinator((User) null)).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment((User) null, cseDept.getId())).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment((User) null, "CSE")).isFalse();

        // Anonymous token
        Authentication anon = new AnonymousAuthenticationToken(
                "key",
                "anonymousUser",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_ANONYMOUS"))
        );
        assertThat(authorizationService.isStudent(anon)).isFalse();
        assertThat(authorizationService.isModerator(anon)).isFalse();
        assertThat(authorizationService.isAdmin(anon)).isFalse();
        assertThat(authorizationService.isStudentCoordinator(anon)).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(anon, cseDept.getId())).isFalse();
    }

    @Test
    @DisplayName("Normal student with CSE department should pass CSE department isolation and fail ECE/other")
    void shouldEnforceDepartmentIsolationForNormalStudent() {
        Authentication auth = createAuth(normalStudent);

        // Department ID
        assertThat(authorizationService.isInUserDepartment(auth, cseDept.getId())).isTrue();
        assertThat(authorizationService.isInUserDepartment(auth, eceDept.getId())).isFalse();
        assertThat(authorizationService.isInUserDepartment(auth, (Long) null)).isFalse();
        assertThat(authorizationService.isInUserDepartment(auth, 999999L)).isFalse();

        // Department Code (case-insensitive)
        assertThat(authorizationService.isInUserDepartment(auth, "CSE")).isTrue();
        assertThat(authorizationService.isInUserDepartment(auth, "cse")).isTrue();
        assertThat(authorizationService.isInUserDepartment(auth, "Cse")).isTrue();
        assertThat(authorizationService.isInUserDepartment(auth, "ECE")).isFalse();
        assertThat(authorizationService.isInUserDepartment(auth, "NON_EXISTENT")).isFalse();
        assertThat(authorizationService.isInUserDepartment(auth, (String) null)).isFalse();
        assertThat(authorizationService.isInUserDepartment(auth, "   ")).isFalse();

        // Department Entity
        assertThat(authorizationService.isInUserDepartment(auth, cseDept)).isTrue();
        assertThat(authorizationService.isInUserDepartment(auth, eceDept)).isFalse();
        assertThat(authorizationService.isInUserDepartment(auth, (Department) null)).isFalse();

        // Direct Entity evaluation
        assertThat(authorizationService.isInUserDepartment(normalStudent, cseDept.getId())).isTrue();
        assertThat(authorizationService.isInUserDepartment(normalStudent, eceDept.getId())).isFalse();
        assertThat(authorizationService.isInUserDepartment(normalStudent, "CSE")).isTrue();
        assertThat(authorizationService.isInUserDepartment(normalStudent, "cse")).isTrue();
        assertThat(authorizationService.isInUserDepartment(normalStudent, "ECE")).isFalse();
        assertThat(authorizationService.isInUserDepartment(normalStudent, cseDept)).isTrue();
        assertThat(authorizationService.isInUserDepartment(normalStudent, eceDept)).isFalse();
    }

    @Test
    @DisplayName("Student coordinator academic department determines academic data scope, not coordinatorDepartment")
    void shouldEnforceAcademicDepartmentScopeForStudentCoordinator() {
        Authentication auth = createAuth(coordinatorStudent);

        // Coordinator is in CSE academic department
        assertThat(authorizationService.isInUserDepartment(auth, cseDept.getId())).isTrue();
        assertThat(authorizationService.isInUserDepartment(auth, "CSE")).isTrue();
        assertThat(authorizationService.isInUserDepartment(auth, "cse")).isTrue();

        // Denied for other department (ECE)
        assertThat(authorizationService.isInUserDepartment(auth, eceDept.getId())).isFalse();
        assertThat(authorizationService.isInUserDepartment(auth, "ECE")).isFalse();

        // Entity checks
        assertThat(authorizationService.isInUserDepartment(coordinatorStudent, cseDept.getId())).isTrue();
        assertThat(authorizationService.isInUserDepartment(coordinatorStudent, eceDept.getId())).isFalse();
    }

    @Test
    @DisplayName("Student with null department must fail closed for department isolation")
    void shouldFailClosedForStudentWithoutDepartment() {
        User noDeptStudent = new User("no.dept@campusnexus.com", "$2a$10$dummyHash", Role.STUDENT);
        noDeptStudent = userRepository.save(noDeptStudent);

        try {
            Authentication auth = createAuth(noDeptStudent);

            assertThat(authorizationService.isInUserDepartment(auth, cseDept.getId())).isFalse();
            assertThat(authorizationService.isInUserDepartment(auth, eceDept.getId())).isFalse();
            assertThat(authorizationService.isInUserDepartment(auth, "CSE")).isFalse();
            assertThat(authorizationService.isInUserDepartment(auth, cseDept)).isFalse();

            assertThat(authorizationService.isInUserDepartment(noDeptStudent, cseDept.getId())).isFalse();
            assertThat(authorizationService.isInUserDepartment(noDeptStudent, "CSE")).isFalse();
            assertThat(authorizationService.isInUserDepartment(noDeptStudent, cseDept)).isFalse();
        } finally {
            userRepository.delete(noDeptStudent);
        }
    }

    @Test
    @DisplayName("MODERATOR and ADMIN must evaluate false for student department isolation while preserving global role checks")
    void shouldPreserveGlobalRolesAndRejectFromStudentDepartmentIsolation() {
        Authentication modAuth = createAuth(moderatorUser);
        assertThat(authorizationService.isModerator(modAuth)).isTrue();
        assertThat(authorizationService.isInUserDepartment(modAuth, cseDept.getId())).isFalse();
        assertThat(authorizationService.isInUserDepartment(modAuth, "CSE")).isFalse();

        Authentication adminAuth = createAuth(adminUser);
        assertThat(authorizationService.isAdmin(adminAuth)).isTrue();
        assertThat(authorizationService.isInUserDepartment(adminAuth, cseDept.getId())).isFalse();
        assertThat(authorizationService.isInUserDepartment(adminAuth, "CSE")).isFalse();

        // Entity checks
        assertThat(authorizationService.isInUserDepartment(moderatorUser, cseDept.getId())).isFalse();
        assertThat(authorizationService.isInUserDepartment(adminUser, cseDept.getId())).isFalse();
    }

    @Test
    @DisplayName("Disabled user accounts should fail authorization checks and return false")
    void shouldRejectDisabledUsers() {
        Authentication auth = createAuth(disabledUser);

        assertThat(authorizationService.isStudent(auth)).isFalse();
        assertThat(authorizationService.isStudentCoordinator(auth)).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, eceDept.getId())).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, "ECE")).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(auth, cseDept.getId())).isFalse();
        assertThat(authorizationService.isInUserDepartment(auth, eceDept.getId())).isFalse();
        assertThat(authorizationService.isInUserDepartment(auth, "ECE")).isFalse();

        // Entity checks
        assertThat(authorizationService.isStudent(disabledUser)).isFalse();
        assertThat(authorizationService.isStudentCoordinator(disabledUser)).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(disabledUser, eceDept.getId())).isFalse();
        assertThat(authorizationService.isCoordinatorForDepartment(disabledUser, "ECE")).isFalse();
        assertThat(authorizationService.isInUserDepartment(disabledUser, eceDept.getId())).isFalse();
        assertThat(authorizationService.isInUserDepartment(disabledUser, "ECE")).isFalse();
    }
}
