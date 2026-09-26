package com.campusnexus.service;

import com.campusnexus.dto.UpdateProfileRequest;
import com.campusnexus.dto.UserDto;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(101L);
        testUser.setEmail("student@mlrit.ac.in");
        testUser.setUsername("student_mlrit");
        testUser.setFullName("Original Student Name");
        testUser.setRole(Role.STUDENT);
        testUser.setHtno("23R21A0501");
        testUser.setEnabled(true);
        testUser.setEmailVerified(true);
    }

    @Test
    @DisplayName("getProfile retrieves user details correctly")
    void testGetProfileSuccess() {
        when(userRepository.findByEmail("student@mlrit.ac.in")).thenReturn(Optional.of(testUser));

        UserDto dto = userService.getProfile("student@mlrit.ac.in");

        assertThat(dto).isNotNull();
        assertThat(dto.email()).isEqualTo("student@mlrit.ac.in");
        assertThat(dto.username()).isEqualTo("student_mlrit");
        assertThat(dto.htno()).isEqualTo("23R21A0501");
    }

    @Test
    @DisplayName("updateProfile successfully modifies fullName and valid username")
    void testUpdateProfileSuccess() {
        when(userRepository.findByEmail("student@mlrit.ac.in")).thenReturn(Optional.of(testUser));
        when(userRepository.existsByUsernameIgnoreCase("new_student_handle")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProfileRequest req = new UpdateProfileRequest("Updated Name", "new_student_handle");
        UserDto updated = userService.updateProfile("student@mlrit.ac.in", req, "127.0.0.1", "JUnit");

        assertThat(updated.fullName()).isEqualTo("Updated Name");
        assertThat(updated.username()).isEqualTo("new_student_handle");
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("updateProfile rejects duplicate username")
    void testUpdateProfileDuplicateUsername() {
        when(userRepository.findByEmail("student@mlrit.ac.in")).thenReturn(Optional.of(testUser));
        when(userRepository.existsByUsernameIgnoreCase("taken_username")).thenReturn(true);

        UpdateProfileRequest req = new UpdateProfileRequest(null, "taken_username");

        assertThatThrownBy(() -> userService.updateProfile("student@mlrit.ac.in", req, "127.0.0.1", "JUnit"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already taken");
    }

    @Test
    @DisplayName("updateProfile rejects invalid username format")
    void testUpdateProfileInvalidFormat() {
        when(userRepository.findByEmail("student@mlrit.ac.in")).thenReturn(Optional.of(testUser));

        UpdateProfileRequest req = new UpdateProfileRequest(null, "ab"); // too short

        assertThatThrownBy(() -> userService.updateProfile("student@mlrit.ac.in", req, "127.0.0.1", "JUnit"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("3-20 characters");
    }
}
