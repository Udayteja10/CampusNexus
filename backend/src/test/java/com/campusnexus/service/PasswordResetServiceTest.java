package com.campusnexus.service;

import com.campusnexus.dto.ForgotPasswordRequest;
import com.campusnexus.dto.ResetPasswordRequest;
import com.campusnexus.dto.VerifyResetCodeRequest;
import com.campusnexus.entity.PasswordResetChallenge;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.EmailVerificationChallengeRepository;
import com.campusnexus.repository.PasswordResetChallengeRepository;
import com.campusnexus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private EmailVerificationChallengeRepository challengeRepository;

    @Mock
    private PasswordResetChallengeRepository resetChallengeRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                departmentRepository,
                challengeRepository,
                resetChallengeRepository,
                auditLogService,
                passwordEncoder,
                null,
                emailService
        );

        testUser = new User();
        testUser.setId(101L);
        testUser.setEmail("student@mlrit.ac.in");
        testUser.setUsername("student_mlrit");
        testUser.setPasswordHash("oldEncodedHash");
        testUser.setRole(Role.STUDENT);
        testUser.setEnabled(true);
        testUser.setEmailVerified(true);
    }

    @Test
    @DisplayName("forgotPassword returns generic message and generates challenge for valid user")
    void testForgotPasswordSuccess() {
        when(userRepository.findByEmail("student@mlrit.ac.in")).thenReturn(Optional.of(testUser));
        when(resetChallengeRepository.findTopByEmailOrderByIdDesc("student@mlrit.ac.in")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashedOtp");

        ForgotPasswordRequest req = new ForgotPasswordRequest("student@mlrit.ac.in");
        String result = authService.forgotPassword(req, "127.0.0.1", "JUnit");

        assertThat(result).contains("If an account exists");
        verify(resetChallengeRepository).save(any(PasswordResetChallenge.class));
        verify(emailService).sendPasswordResetOtp(eq("student@mlrit.ac.in"), any(), anyString(), eq(10));
    }

    @Test
    @DisplayName("forgotPassword does not leak account existence for unknown user")
    void testForgotPasswordUnknownUser() {
        when(userRepository.findByEmail("unknown@mlrit.ac.in")).thenReturn(Optional.empty());
        when(userRepository.findByUsernameIgnoreCase("unknown@mlrit.ac.in")).thenReturn(Optional.empty());

        ForgotPasswordRequest req = new ForgotPasswordRequest("unknown@mlrit.ac.in");
        String result = authService.forgotPassword(req, "127.0.0.1", "JUnit");

        assertThat(result).contains("If an account exists");
    }

    @Test
    @DisplayName("verifyResetCode succeeds with matching OTP")
    void testVerifyResetCodeSuccess() {
        PasswordResetChallenge challenge = new PasswordResetChallenge(
                testUser, testUser.getEmail(), "hashedOtp", LocalDateTime.now().plusMinutes(10)
        );

        when(userRepository.findByEmail("student@mlrit.ac.in")).thenReturn(Optional.of(testUser));
        when(resetChallengeRepository.findTopByEmailOrderByIdDesc("student@mlrit.ac.in")).thenReturn(Optional.of(challenge));
        when(passwordEncoder.matches("123456", "hashedOtp")).thenReturn(true);

        VerifyResetCodeRequest req = new VerifyResetCodeRequest("student@mlrit.ac.in", "123456");
        String res = authService.verifyResetCode(req, "127.0.0.1", "JUnit");

        assertThat(res).isEqualTo("Verification code is valid.");
    }

    @Test
    @DisplayName("verifyResetCode rejects invalid code and increments attempts")
    void testVerifyResetCodeFailure() {
        PasswordResetChallenge challenge = new PasswordResetChallenge(
                testUser, testUser.getEmail(), "hashedOtp", LocalDateTime.now().plusMinutes(10)
        );

        when(userRepository.findByEmail("student@mlrit.ac.in")).thenReturn(Optional.of(testUser));
        when(resetChallengeRepository.findTopByEmailOrderByIdDesc("student@mlrit.ac.in")).thenReturn(Optional.of(challenge));
        when(passwordEncoder.matches("000000", "hashedOtp")).thenReturn(false);

        VerifyResetCodeRequest req = new VerifyResetCodeRequest("student@mlrit.ac.in", "000000");

        assertThatThrownBy(() -> authService.verifyResetCode(req, "127.0.0.1", "JUnit"))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid verification code");

        assertThat(challenge.getAttempts()).isEqualTo(1);
    }

    @Test
    @DisplayName("resetPassword updates password hash and consumes challenge")
    void testResetPasswordSuccess() {
        PasswordResetChallenge challenge = new PasswordResetChallenge(
                testUser, testUser.getEmail(), "hashedOtp", LocalDateTime.now().plusMinutes(10)
        );

        when(userRepository.findByEmail("student@mlrit.ac.in")).thenReturn(Optional.of(testUser));
        when(resetChallengeRepository.findTopByEmailOrderByIdDesc("student@mlrit.ac.in")).thenReturn(Optional.of(challenge));
        when(passwordEncoder.matches("123456", "hashedOtp")).thenReturn(true);
        when(passwordEncoder.encode("NewSecret@123")).thenReturn("newPasswordHash");

        ResetPasswordRequest req = new ResetPasswordRequest("student@mlrit.ac.in", "123456", "NewSecret@123", "NewSecret@123");
        String res = authService.resetPassword(req, "127.0.0.1", "JUnit");

        assertThat(res).contains("Password has been reset successfully");
        assertThat(testUser.getPasswordHash()).isEqualTo("newPasswordHash");
        assertThat(challenge.isConsumed()).isTrue();
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("resetPassword must NEVER alter emailVerified status (remains false for unverified student)")
    void testResetPasswordDoesNotAlterUnverifiedStatus() {
        testUser.setEmailVerified(false);
        PasswordResetChallenge challenge = new PasswordResetChallenge(
                testUser, testUser.getEmail(), "hashedOtp", LocalDateTime.now().plusMinutes(10)
        );

        when(userRepository.findByEmail("student@mlrit.ac.in")).thenReturn(Optional.of(testUser));
        when(resetChallengeRepository.findTopByEmailOrderByIdDesc("student@mlrit.ac.in")).thenReturn(Optional.of(challenge));
        when(passwordEncoder.matches("123456", "hashedOtp")).thenReturn(true);
        when(passwordEncoder.encode("NewSecret@123")).thenReturn("newPasswordHash");

        ResetPasswordRequest req = new ResetPasswordRequest("student@mlrit.ac.in", "123456", "NewSecret@123", "NewSecret@123");
        String res = authService.resetPassword(req, "127.0.0.1", "JUnit");

        assertThat(res).contains("Password has been reset successfully");
        assertThat(testUser.isEmailVerified()).isFalse(); // MUST remain false
        assertThat(testUser.getPasswordHash()).isEqualTo("newPasswordHash");
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("verifyOtp sets emailVerified=true when called with username or email")
    void testVerifyOtpWithUsernameOrEmail() {
        testUser.setEmailVerified(false);
        com.campusnexus.entity.EmailVerificationChallenge evc = new com.campusnexus.entity.EmailVerificationChallenge(
                testUser, testUser.getEmail(), "hashedOtp", LocalDateTime.now().plusMinutes(10)
        );

        when(userRepository.findByEmail("student_mlrit")).thenReturn(Optional.empty());
        when(userRepository.findByUsernameIgnoreCase("student_mlrit")).thenReturn(Optional.of(testUser));
        when(challengeRepository.findTopByEmailOrderByIdDesc("student@mlrit.ac.in")).thenReturn(Optional.of(evc));
        when(passwordEncoder.matches("123456", "hashedOtp")).thenReturn(true);

        com.campusnexus.dto.VerifyOtpRequest req = new com.campusnexus.dto.VerifyOtpRequest("student_mlrit", "123456");
        authService.verifyOtp(req, "127.0.0.1", "JUnit");

        assertThat(testUser.isEmailVerified()).isTrue();
        assertThat(evc.isConsumed()).isTrue();
        verify(userRepository).save(testUser);
    }
}
