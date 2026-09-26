package com.campusnexus.repository;

import com.campusnexus.entity.Department;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.util.HtnoUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class HtnoPersistenceTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    private static final String STUDENT_1_EMAIL = "htno.student1@campusnexus.com";
    private static final String STUDENT_2_EMAIL = "htno.student2@campusnexus.com";
    private static final String STUDENT_3_EMAIL = "htno.student3@campusnexus.com";
    private static final String MODERATOR_EMAIL = "htno.moderator@campusnexus.com";
    private static final String ADMIN_EMAIL = "htno.admin@campusnexus.com";

    private static final String VALID_R21_HTNO = "23R21A0201";
    private static final String VALID_R25_HTNO = "24R25A0401";

    @BeforeEach
    @AfterEach
    void cleanUp() {
        userRepository.findByEmail(STUDENT_1_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(STUDENT_2_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(STUDENT_3_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(MODERATOR_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(ADMIN_EMAIL).ifPresent(userRepository::delete);
    }

    @Test
    @Transactional
    @DisplayName("Should persist and retrieve user with valid HTNO and academic fields")
    void shouldPersistAndRetrieveUserWithHtno() {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();

        User user = new User(
                STUDENT_1_EMAIL,
                "$2a$10$dummyPasswordHashForHtnoTest",
                Role.STUDENT,
                2023,
                "R21",
                4,
                cse,
                VALID_R21_HTNO
        );

        User saved = userRepository.save(user);
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getHtno()).isEqualTo(VALID_R21_HTNO);

        Optional<User> byEmail = userRepository.findByEmail(STUDENT_1_EMAIL);
        assertThat(byEmail).isPresent();
        assertThat(byEmail.get().getHtno()).isEqualTo(VALID_R21_HTNO);

        Optional<User> byHtno = userRepository.findByHtno(VALID_R21_HTNO);
        assertThat(byHtno).isPresent();
        assertThat(byHtno.get().getEmail()).isEqualTo(STUDENT_1_EMAIL);
        assertThat(byHtno.get().getHtno()).isEqualTo(VALID_R21_HTNO);

        assertThat(userRepository.existsByHtno(VALID_R21_HTNO)).isTrue();
        assertThat(userRepository.existsByHtno("NONEXISTENT_HTNO")).isFalse();
    }

    @Test
    @DisplayName("Should allow users across all roles to have null HTNO and support multiple null values")
    void shouldSupportUsersWithNullHtno() {
        User student = new User(STUDENT_1_EMAIL, "$2a$10$hash1", Role.STUDENT);
        userRepository.save(student);

        User moderator = new User(MODERATOR_EMAIL, "$2a$10$hash2", Role.MODERATOR);
        userRepository.save(moderator);

        User admin = new User(ADMIN_EMAIL, "$2a$10$hash3", Role.ADMIN);
        userRepository.save(admin);

        Optional<User> fetchedStudent = userRepository.findByEmail(STUDENT_1_EMAIL);
        assertThat(fetchedStudent).isPresent();
        assertThat(fetchedStudent.get().getHtno()).isNull();

        Optional<User> fetchedMod = userRepository.findByEmail(MODERATOR_EMAIL);
        assertThat(fetchedMod).isPresent();
        assertThat(fetchedMod.get().getHtno()).isNull();

        Optional<User> fetchedAdmin = userRepository.findByEmail(ADMIN_EMAIL);
        assertThat(fetchedAdmin).isPresent();
        assertThat(fetchedAdmin.get().getHtno()).isNull();
    }

    @Test
    @DisplayName("Should enforce database-level uniqueness constraint on HTNO and reject duplicates")
    void shouldEnforceHtnoUniqueness() {
        User user1 = new User(
                STUDENT_1_EMAIL,
                "$2a$10$hash1",
                Role.STUDENT,
                2023,
                "R21",
                4,
                null,
                VALID_R21_HTNO
        );
        userRepository.saveAndFlush(user1);

        User user2 = new User(
                STUDENT_2_EMAIL,
                "$2a$10$hash2",
                Role.STUDENT,
                2024,
                "R25",
                3,
                null,
                VALID_R21_HTNO // Duplicate HTNO
        );

        assertThatThrownBy(() -> userRepository.saveAndFlush(user2))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Should deterministically normalize HTNO by trimming whitespace and converting to uppercase via HtnoUtils")
    void shouldNormalizeHtnoViaHtnoUtils() {
        assertThat(HtnoUtils.normalize("  23r21a0201  ")).isEqualTo("23R21A0201");
        assertThat(HtnoUtils.normalize("24r25a0401")).isEqualTo("24R25A0401");
        assertThat(HtnoUtils.normalize("   ")).isNull();
        assertThat(HtnoUtils.normalize(null)).isNull();

        // Entity stores normalized value directly
        User user = new User(
                STUDENT_1_EMAIL,
                "$2a$10$hash",
                Role.STUDENT
        );
        user.setHtno(HtnoUtils.normalize("  23r21a0201  "));
        assertThat(user.getHtno()).isEqualTo("23R21A0201");
    }

    @Test
    @Transactional
    @DisplayName("Should update HTNO independently without modifying admissionYear, regulation, yearOfStudy, or department")
    void shouldNotInferOrMutateAcademicFieldsFromHtno() {
        Department ece = departmentRepository.findByCode("ECE").orElseThrow();

        User user = new User(
                STUDENT_1_EMAIL,
                "$2a$10$hash",
                Role.STUDENT,
                2024,
                "R25",
                3,
                ece,
                null
        );
        userRepository.save(user);

        // Assign HTNO
        User savedUser = userRepository.findByEmail(STUDENT_1_EMAIL).orElseThrow();
        savedUser.setHtno(VALID_R25_HTNO);
        userRepository.save(savedUser);

        User reloadedUser = userRepository.findByEmail(STUDENT_1_EMAIL).orElseThrow();
        assertThat(reloadedUser.getHtno()).isEqualTo(VALID_R25_HTNO);
        // Verify academic fields were NOT overwritten or modified
        assertThat(reloadedUser.getAdmissionYear()).isEqualTo(2024);
        assertThat(reloadedUser.getRegulation()).isEqualTo("R25");
        assertThat(reloadedUser.getYearOfStudy()).isEqualTo(3);
        assertThat(reloadedUser.getDepartment()).isNotNull();
        assertThat(reloadedUser.getDepartment().getCode()).isEqualTo("ECE");
    }

    @Test
    @DisplayName("HtnoUtils should correctly validate structural bounds without rejecting R25 or future formats")
    void shouldValidateHtnoStructurally() {
        assertThat(HtnoUtils.isValid("23R21A0201")).isTrue();
        assertThat(HtnoUtils.isValid("24R25A0401")).isTrue();
        assertThat(HtnoUtils.isValid("25R25A0501")).isTrue();
        assertThat(HtnoUtils.isValid("  23r21a0201  ")).isTrue();
        assertThat(HtnoUtils.isValid(null)).isTrue();
        assertThat(HtnoUtils.isValid("")).isTrue();

        // Invalid cases
        assertThat(HtnoUtils.isValid("THIS_IS_LONGER_THAN_20_CHARACTERS_123456")).isFalse();
        assertThat(HtnoUtils.isValid("23R21A@201")).isFalse(); // Special character
    }
}
