package com.campusnexus.service;

import com.campusnexus.dto.UserDto;
import com.campusnexus.entity.Department;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class StudentCoordinatorServiceTest {

    @Autowired
    private StudentCoordinatorService studentCoordinatorService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    private static final String STUDENT_1_EMAIL = "coord.student1@campusnexus.com";
    private static final String STUDENT_2_EMAIL = "coord.student2@campusnexus.com";
    private static final String MODERATOR_EMAIL = "coord.moderator@campusnexus.com";
    private static final String ADMIN_EMAIL = "coord.admin@campusnexus.com";

    @BeforeEach
    @AfterEach
    void cleanUp() {
        userRepository.findByEmail(STUDENT_1_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(STUDENT_2_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(MODERATOR_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(ADMIN_EMAIL).ifPresent(userRepository::delete);
    }

    @Test
    @WithMockUser(username = "admin@campusnexus.com", roles = {"ADMIN"})
    @DisplayName("ADMIN should successfully assign a STUDENT as coordinator of their own department")
    void shouldAssignCoordinatorSuccessfully() {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();

        User student = new User(
                STUDENT_1_EMAIL,
                "$2a$10$dummyHash1",
                Role.STUDENT,
                2023,
                "R21",
                4,
                cse,
                "23R21A0201"
        );
        User savedStudent = userRepository.save(student);

        UserDto result = studentCoordinatorService.assignCoordinator(savedStudent.getId(), cse.getId());

        assertThat(result).isNotNull();
        assertThat(result.coordinatorDepartment()).isEqualTo("CSE");
        assertThat(result.department()).isEqualTo("CSE");
        assertThat(result.role()).isEqualTo(Role.STUDENT);
        assertThat(result.htno()).isEqualTo("23R21A0201");

        // Verify persistence directly
        User fetched = userRepository.findById(savedStudent.getId()).orElseThrow();
        assertThat(fetched.getCoordinatorDepartment()).isNotNull();
        assertThat(fetched.getCoordinatorDepartment().getId()).isEqualTo(cse.getId());
    }

    @Test
    @WithMockUser(username = "admin@campusnexus.com", roles = {"ADMIN"})
    @DisplayName("ADMIN should remove coordinator permission while preserving department, role, HTNO, and academic data")
    void shouldRemoveCoordinatorSuccessfully() {
        Department ece = departmentRepository.findByCode("ECE").orElseThrow();

        User student = new User(
                STUDENT_1_EMAIL,
                "$2a$10$dummyHash1",
                Role.STUDENT,
                2024,
                "R25",
                3,
                ece,
                "24R25A0401",
                ece
        );
        User savedStudent = userRepository.save(student);

        UserDto result = studentCoordinatorService.removeCoordinator(savedStudent.getId());

        assertThat(result.coordinatorDepartment()).isNull();
        assertThat(result.department()).isEqualTo("ECE");
        assertThat(result.role()).isEqualTo(Role.STUDENT);
        assertThat(result.htno()).isEqualTo("24R25A0401");
        assertThat(result.admissionYear()).isEqualTo(2024);
        assertThat(result.regulation()).isEqualTo("R25");
        assertThat(result.yearOfStudy()).isEqualTo(3);

        // Verify entity state directly
        User fetched = userRepository.findById(savedStudent.getId()).orElseThrow();
        assertThat(fetched.getCoordinatorDepartment()).isNull();
        assertThat(fetched.getDepartment()).isNotNull();
        assertThat(fetched.getDepartment().getId()).isEqualTo(ece.getId());
        assertThat(fetched.getRole()).isEqualTo(Role.STUDENT);
        assertThat(fetched.getHtno()).isEqualTo("24R25A0401");
    }

    @Test
    @WithMockUser(username = "student@campusnexus.com", roles = {"STUDENT"})
    @DisplayName("STUDENT role cannot perform coordinator assignment")
    void shouldRejectStudentAssignment() {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();
        User student = new User(STUDENT_1_EMAIL, "$2a$10$hash", Role.STUDENT, 2023, "R21", 4, cse);
        User savedStudent = userRepository.save(student);

        assertThatThrownBy(() -> studentCoordinatorService.assignCoordinator(savedStudent.getId(), cse.getId()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @WithMockUser(username = "moderator@campusnexus.com", roles = {"MODERATOR"})
    @DisplayName("MODERATOR role cannot perform coordinator assignment")
    void shouldRejectModeratorAssignment() {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();
        User student = new User(STUDENT_1_EMAIL, "$2a$10$hash", Role.STUDENT, 2023, "R21", 4, cse);
        User savedStudent = userRepository.save(student);

        assertThatThrownBy(() -> studentCoordinatorService.assignCoordinator(savedStudent.getId(), cse.getId()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @WithMockUser(username = "student@campusnexus.com", roles = {"STUDENT"})
    @DisplayName("STUDENT role cannot perform coordinator removal")
    void shouldRejectStudentRemoval() {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();
        User student = new User(STUDENT_1_EMAIL, "$2a$10$hash", Role.STUDENT, 2023, "R21", 4, cse, null, cse);
        User savedStudent = userRepository.save(student);

        assertThatThrownBy(() -> studentCoordinatorService.removeCoordinator(savedStudent.getId()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @WithMockUser(username = "moderator@campusnexus.com", roles = {"MODERATOR"})
    @DisplayName("MODERATOR role cannot perform coordinator removal")
    void shouldRejectModeratorRemoval() {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();
        User student = new User(STUDENT_1_EMAIL, "$2a$10$hash", Role.STUDENT, 2023, "R21", 4, cse, null, cse);
        User savedStudent = userRepository.save(student);

        assertThatThrownBy(() -> studentCoordinatorService.removeCoordinator(savedStudent.getId()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @WithMockUser(username = "admin@campusnexus.com", roles = {"ADMIN"})
    @DisplayName("Should reject coordinator assignment for non-STUDENT users (MODERATOR or ADMIN)")
    void shouldRejectNonStudentCoordinatorAssignment() {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();

        User moderator = new User(MODERATOR_EMAIL, "$2a$10$hash", Role.MODERATOR, 2023, "R21", 4, cse);
        User savedMod = userRepository.save(moderator);

        User admin = new User(ADMIN_EMAIL, "$2a$10$hash", Role.ADMIN, 2023, "R21", 4, cse);
        User savedAdmin = userRepository.save(admin);

        assertThatThrownBy(() -> studentCoordinatorService.assignCoordinator(savedMod.getId(), cse.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Only users with role STUDENT can be assigned");

        assertThatThrownBy(() -> studentCoordinatorService.assignCoordinator(savedAdmin.getId(), cse.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Only users with role STUDENT can be assigned");
    }

    @Test
    @WithMockUser(username = "admin@campusnexus.com", roles = {"ADMIN"})
    @DisplayName("Should reject assigning student to coordinate a different department than their academic department")
    void shouldRejectCrossDepartmentCoordinatorAssignment() {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();
        Department ece = departmentRepository.findByCode("ECE").orElseThrow();

        // Student belongs to CSE
        User student = new User(STUDENT_1_EMAIL, "$2a$10$hash", Role.STUDENT, 2023, "R21", 4, cse);
        User savedStudent = userRepository.save(student);

        // Attempt to assign student as ECE coordinator
        assertThatThrownBy(() -> studentCoordinatorService.assignCoordinator(savedStudent.getId(), ece.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("A student can only coordinate their own academic department");
    }

    @Test
    @WithMockUser(username = "admin@campusnexus.com", roles = {"ADMIN"})
    @DisplayName("Should reject assigning student coordinator when student has no academic department")
    void shouldRejectStudentWithoutDepartment() {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();

        User student = new User(STUDENT_1_EMAIL, "$2a$10$hash", Role.STUDENT);
        User savedStudent = userRepository.save(student);

        assertThatThrownBy(() -> studentCoordinatorService.assignCoordinator(savedStudent.getId(), cse.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Target student must have an assigned academic department");
    }

    @Test
    @WithMockUser(username = "admin@campusnexus.com", roles = {"ADMIN"})
    @DisplayName("Should reject assigning second coordinator to department that already has an active coordinator")
    void shouldRejectDuplicateCoordinatorForSameDepartment() {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();

        User student1 = new User(STUDENT_1_EMAIL, "$2a$10$hash1", Role.STUDENT, 2023, "R21", 4, cse, null, cse);
        userRepository.save(student1);

        User student2 = new User(STUDENT_2_EMAIL, "$2a$10$hash2", Role.STUDENT, 2023, "R21", 4, cse);
        User savedStudent2 = userRepository.save(student2);

        // Attempt to assign student2 as CSE coordinator when student1 is already coordinator
        assertThatThrownBy(() -> studentCoordinatorService.assignCoordinator(savedStudent2.getId(), cse.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already has an assigned student coordinator");
    }

    @Test
    @DisplayName("Should verify database unique constraint uk_users_coordinator_department rejects duplicate non-null coordinatorDepartment")
    void shouldEnforceDatabaseLevelCoordinatorUniqueness() {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();

        User student1 = new User(STUDENT_1_EMAIL, "$2a$10$hash1", Role.STUDENT, 2023, "R21", 4, cse, null, cse);
        userRepository.saveAndFlush(student1);

        User student2 = new User(STUDENT_2_EMAIL, "$2a$10$hash2", Role.STUDENT, 2023, "R21", 4, cse, null, cse);

        assertThatThrownBy(() -> userRepository.saveAndFlush(student2))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
