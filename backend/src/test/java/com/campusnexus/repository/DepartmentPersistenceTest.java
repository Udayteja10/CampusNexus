package com.campusnexus.repository;

import com.campusnexus.entity.Department;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.service.DepartmentService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class DepartmentPersistenceTest {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private UserRepository userRepository;

    private static final String TEST_USER_EMAIL = "dept.test.student@campusnexus.com";
    private static final String TEST_DEPT_CODE = "TEST_DEPT";

    @BeforeEach
    @AfterEach
    void cleanUp() {
        userRepository.findByEmail(TEST_USER_EMAIL).ifPresent(userRepository::delete);
        departmentRepository.findByCode(TEST_DEPT_CODE).ifPresent(departmentRepository::delete);
    }

    @Test
    @DisplayName("Flyway V5 seed should contain exactly the nine canonical departments and not AIDS")
    void shouldVerifyCanonicalSeedDepartments() {
        List<String> canonicalCodes = List.of("CSE", "ECE", "EEE", "IT", "CSM", "CSD", "CSIT", "MECH", "CIVIL");

        for (String code : canonicalCodes) {
            Optional<Department> dept = departmentRepository.findByCode(code);
            assertThat(dept).as("Department %s should exist", code).isPresent();
            assertThat(dept.get().isActive()).isTrue();
            assertThat(dept.get().getName()).isNotBlank();
        }

        // Verify CSM and CSD are distinct departments
        Optional<Department> csm = departmentRepository.findByCode("CSM");
        Optional<Department> csd = departmentRepository.findByCode("CSD");
        assertThat(csm).isPresent();
        assertThat(csd).isPresent();
        assertThat(csm.get().getId()).isNotEqualTo(csd.get().getId());
        assertThat(csm.get().getCode()).isEqualTo("CSM");
        assertThat(csd.get().getCode()).isEqualTo("CSD");

        // Verify AIDS is NOT in the canonical seed data
        assertThat(departmentRepository.existsByCode("AIDS")).isFalse();
        assertThat(departmentRepository.findByCode("AIDS")).isEmpty();
    }

    @Test
    @DisplayName("DepartmentRepository and DepartmentService should find departments by ID, code, and case-insensitively")
    void shouldFindDepartmentByCodeAndCaseInsensitive() {
        Optional<Department> cse = departmentService.getDepartmentByCode("CSE");
        assertThat(cse).isPresent();

        Optional<Department> cseLower = departmentService.getDepartmentByCodeIgnoreCase("cse");
        assertThat(cseLower).isPresent();
        assertThat(cseLower.get().getId()).isEqualTo(cse.get().getId());

        assertThat(departmentService.existsByCode("CSE")).isTrue();
        assertThat(departmentService.existsByCode("NON_EXISTENT")).isFalse();

        List<Department> activeDepts = departmentService.getAllActiveDepartments();
        assertThat(activeDepts).isNotEmpty();
        assertThat(activeDepts.stream().map(Department::getCode)).containsAll(List.of("CSE", "ECE", "EEE", "IT", "CSM", "CSD", "CSIT", "MECH", "CIVIL"));
    }

    @Test
    @DisplayName("Department entity should persist successfully and reject duplicate code")
    void shouldPersistDepartmentAndEnforceUniqueCode() {
        Department newDept = new Department(TEST_DEPT_CODE, "Test Department Name", "TD", true);
        Department saved = departmentRepository.save(newDept);
        assertThat(saved.getId()).isNotNull();

        Optional<Department> retrieved = departmentRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getCode()).isEqualTo(TEST_DEPT_CODE);
        assertThat(retrieved.get().getName()).isEqualTo("Test Department Name");
        assertThat(retrieved.get().getShortName()).isEqualTo("TD");
        assertThat(retrieved.get().isActive()).isTrue();
        assertThat(retrieved.get().getCreatedAt()).isNotNull();

        // Attempt duplicate department code
        Department duplicate = new Department(TEST_DEPT_CODE, "Duplicate Dept", "DUP", true);
        assertThatThrownBy(() -> departmentRepository.saveAndFlush(duplicate))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @Transactional
    @DisplayName("User should successfully reference Department through @ManyToOne relationship")
    void shouldPersistUserWithDepartmentRelationship() {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();

        User user = new User(
                TEST_USER_EMAIL,
                "$2a$10$dummyPasswordHashForDeptTest",
                Role.STUDENT,
                2023,
                "R21",
                4,
                cse
        );

        User savedUser = userRepository.save(user);
        assertThat(savedUser.getId()).isNotNull();

        User fetched = userRepository.findByEmail(TEST_USER_EMAIL).orElseThrow();
        assertThat(fetched.getDepartment()).isNotNull();
        assertThat(fetched.getDepartment().getId()).isEqualTo(cse.getId());
        assertThat(fetched.getDepartment().getCode()).isEqualTo("CSE");
        assertThat(fetched.getDepartment().getName()).isEqualTo(cse.getName());
    }

    @Test
    @DisplayName("User department relationship can be NULL for STUDENT, MODERATOR, and ADMIN")
    void shouldAllowNullDepartmentForUsers() {
        User student = new User("dept.null.student@campusnexus.com", "$2a$10$dummyHash1", Role.STUDENT);
        User savedStudent = userRepository.save(student);

        User moderator = new User("dept.null.moderator@campusnexus.com", "$2a$10$dummyHash2", Role.MODERATOR);
        User savedMod = userRepository.save(moderator);

        User admin = new User("dept.null.admin@campusnexus.com", "$2a$10$dummyHash3", Role.ADMIN);
        User savedAdmin = userRepository.save(admin);

        try {
            User fetchedStudent = userRepository.findByEmail("dept.null.student@campusnexus.com").orElseThrow();
            assertThat(fetchedStudent.getDepartment()).isNull();

            User fetchedMod = userRepository.findByEmail("dept.null.moderator@campusnexus.com").orElseThrow();
            assertThat(fetchedMod.getDepartment()).isNull();

            User fetchedAdmin = userRepository.findByEmail("dept.null.admin@campusnexus.com").orElseThrow();
            assertThat(fetchedAdmin.getDepartment()).isNull();
        } finally {
            userRepository.delete(savedStudent);
            userRepository.delete(savedMod);
            userRepository.delete(savedAdmin);
        }
    }
}
