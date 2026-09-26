package com.campusnexus.repository;

import com.campusnexus.entity.Department;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class UserAcademicInfoPersistenceTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    private static final String STUDENT_EMAIL = "academic.student@campusnexus.com";
    private static final String MODERATOR_EMAIL = "academic.moderator@campusnexus.com";
    private static final String ADMIN_EMAIL = "academic.admin@campusnexus.com";

    @BeforeEach
    @AfterEach
    void cleanUp() {
        userRepository.findByEmail(STUDENT_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(MODERATOR_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(ADMIN_EMAIL).ifPresent(userRepository::delete);
    }

    @Test
    @Transactional
    @DisplayName("Should persist and retrieve user with all four academic fields populated")
    void shouldPersistAndRetrieveUserWithAcademicInfo() {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();

        User user = new User(
                STUDENT_EMAIL,
                "$2a$10$dummyHashedPasswordStringForTestingOnly",
                Role.STUDENT,
                2023,
                "R21",
                4,
                cse
        );

        User savedUser = userRepository.save(user);
        assertThat(savedUser.getId()).isNotNull();

        Optional<User> retrieved = userRepository.findByEmail(STUDENT_EMAIL);
        assertThat(retrieved).isPresent();
        User fetchedUser = retrieved.get();
        assertThat(fetchedUser.getEmail()).isEqualTo(STUDENT_EMAIL);
        assertThat(fetchedUser.getRole()).isEqualTo(Role.STUDENT);
        assertThat(fetchedUser.getAdmissionYear()).isEqualTo(2023);
        assertThat(fetchedUser.getRegulation()).isEqualTo("R21");
        assertThat(fetchedUser.getYearOfStudy()).isEqualTo(4);
        assertThat(fetchedUser.getDepartment()).isNotNull();
        assertThat(fetchedUser.getDepartment().getCode()).isEqualTo("CSE");
    }

    @Test
    @DisplayName("Should persist and retrieve users of all roles (STUDENT, MODERATOR, ADMIN) with null academic fields")
    void shouldSupportUsersWithNullAcademicFields() {
        // STUDENT with null academic fields
        User student = new User(STUDENT_EMAIL, "$2a$10$dummyHash1", Role.STUDENT);
        userRepository.save(student);

        // MODERATOR with null academic fields
        User moderator = new User(MODERATOR_EMAIL, "$2a$10$dummyHash2", Role.MODERATOR);
        userRepository.save(moderator);

        // ADMIN with null academic fields
        User admin = new User(ADMIN_EMAIL, "$2a$10$dummyHash3", Role.ADMIN);
        userRepository.save(admin);

        Optional<User> fetchedStudent = userRepository.findByEmail(STUDENT_EMAIL);
        assertThat(fetchedStudent).isPresent();
        assertThat(fetchedStudent.get().getAdmissionYear()).isNull();
        assertThat(fetchedStudent.get().getRegulation()).isNull();
        assertThat(fetchedStudent.get().getYearOfStudy()).isNull();
        assertThat(fetchedStudent.get().getDepartment()).isNull();
        assertThat(fetchedStudent.get().getHtno()).isNull();

        Optional<User> fetchedModerator = userRepository.findByEmail(MODERATOR_EMAIL);
        assertThat(fetchedModerator).isPresent();
        assertThat(fetchedModerator.get().getAdmissionYear()).isNull();
        assertThat(fetchedModerator.get().getRegulation()).isNull();
        assertThat(fetchedModerator.get().getYearOfStudy()).isNull();
        assertThat(fetchedModerator.get().getDepartment()).isNull();
        assertThat(fetchedModerator.get().getHtno()).isNull();

        Optional<User> fetchedAdmin = userRepository.findByEmail(ADMIN_EMAIL);
        assertThat(fetchedAdmin).isPresent();
        assertThat(fetchedAdmin.get().getAdmissionYear()).isNull();
        assertThat(fetchedAdmin.get().getRegulation()).isNull();
        assertThat(fetchedAdmin.get().getYearOfStudy()).isNull();
        assertThat(fetchedAdmin.get().getDepartment()).isNull();
        assertThat(fetchedAdmin.get().getHtno()).isNull();
    }

    @Test
    @Transactional
    @DisplayName("Should update individual academic fields independently without side effects")
    void shouldUpdateAcademicFieldsIndependently() {
        User user = new User(STUDENT_EMAIL, "$2a$10$dummyHash", Role.STUDENT);
        userRepository.save(user);

        Department ece = departmentRepository.findByCode("ECE").orElseThrow();

        User savedUser = userRepository.findByEmail(STUDENT_EMAIL).orElseThrow();
        savedUser.setAdmissionYear(2024);
        savedUser.setRegulation("R25");
        savedUser.setYearOfStudy(3);
        savedUser.setDepartment(ece);
        userRepository.save(savedUser);

        User updatedUser = userRepository.findByEmail(STUDENT_EMAIL).orElseThrow();
        assertThat(updatedUser.getAdmissionYear()).isEqualTo(2024);
        assertThat(updatedUser.getRegulation()).isEqualTo("R25");
        assertThat(updatedUser.getYearOfStudy()).isEqualTo(3);
        assertThat(updatedUser.getDepartment()).isNotNull();
        assertThat(updatedUser.getDepartment().getCode()).isEqualTo("ECE");

        // Update one field only
        updatedUser.setYearOfStudy(4);
        userRepository.save(updatedUser);

        User reloadedUser = userRepository.findByEmail(STUDENT_EMAIL).orElseThrow();
        assertThat(reloadedUser.getYearOfStudy()).isEqualTo(4);
        assertThat(reloadedUser.getAdmissionYear()).isEqualTo(2024);
        assertThat(reloadedUser.getRegulation()).isEqualTo("R25");
        assertThat(reloadedUser.getDepartment()).isNotNull();
        assertThat(reloadedUser.getDepartment().getCode()).isEqualTo("ECE");
    }
}
