package com.campusnexus.controller;

import com.campusnexus.dto.ForgotPasswordRequest;
import com.campusnexus.dto.LoginRequest;
import com.campusnexus.dto.RegisterRequest;
import com.campusnexus.dto.ResendOtpRequest;
import com.campusnexus.dto.ResetPasswordRequest;
import com.campusnexus.dto.VerifyOtpRequest;
import com.campusnexus.entity.Department;
import com.campusnexus.entity.EmailVerificationChallenge;
import com.campusnexus.entity.PasswordResetChallenge;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.EmailVerificationChallengeRepository;
import com.campusnexus.repository.PasswordResetChallengeRepository;
import com.campusnexus.repository.UserRepository;
import com.campusnexus.service.EmailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmailVerificationChallengeRepository challengeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PasswordResetChallengeRepository resetChallengeRepository;

    @MockBean
    private EmailService emailService;

    private static final String TEST_HTNO = "23R21A0599";
    private static final String TEST_EMAIL = "23r21a0599@mlrit.ac.in";
    private static final String TEST_USERNAME = "student_test_99";
    private static final String TEST_PASSWORD = "Password@123";

    @BeforeEach
    @AfterEach
    @Transactional
    void cleanUp() {
        challengeRepository.deleteAllByEmail(TEST_EMAIL);
        resetChallengeRepository.deleteAllByEmail(TEST_EMAIL);
        userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);

        challengeRepository.deleteAllByEmail("24r25a0402@mlrit.ac.in");
        resetChallengeRepository.deleteAllByEmail("24r25a0402@mlrit.ac.in");
        userRepository.findByEmail("24r25a0402@mlrit.ac.in").ifPresent(userRepository::delete);

        challengeRepository.deleteAllByEmail("disabled.user@mlrit.ac.in");
        resetChallengeRepository.deleteAllByEmail("disabled.user@mlrit.ac.in");
        userRepository.findByEmail("disabled.user@mlrit.ac.in").ifPresent(userRepository::delete);
    }

    @Test
    @DisplayName("GET /api/v1/auth/username-availability should check format, reserved names, and uniqueness")
    void shouldCheckUsernameAvailability() throws Exception {
        // Available username
        mockMvc.perform(get("/api/v1/auth/username-availability")
                        .param("username", "cool_coder_23"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.available", is(true)))
                .andExpect(jsonPath("$.data.username", is("cool_coder_23")));

        // Reserved username
        mockMvc.perform(get("/api/v1/auth/username-availability")
                        .param("username", "admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.available", is(false)));

        // Invalid format (too short / special chars)
        mockMvc.perform(get("/api/v1/auth/username-availability")
                        .param("username", "ab"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.available", is(false)));
    }

    @Test
    @DisplayName("GET /api/v1/auth/validate-htno should return derived academic metadata for valid HTNO")
    void shouldValidateHtnoSuccessfully() throws Exception {
        mockMvc.perform(get("/api/v1/auth/validate-htno")
                        .param("htno", TEST_HTNO))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.valid", is(true)))
                .andExpect(jsonPath("$.data.available", is(true)))
                .andExpect(jsonPath("$.data.admissionYear", is(2023)))
                .andExpect(jsonPath("$.data.yearOfStudy", is(4)))
                .andExpect(jsonPath("$.data.regulation", is("R21")))
                .andExpect(jsonPath("$.data.department", is("CSE")))
                .andExpect(jsonPath("$.data.email", is(TEST_EMAIL)));
    }

    @Test
    @DisplayName("Public registration should derive academic attributes from HTNO, enforce STUDENT role, and issue OTP challenge")
    void shouldRegisterSuccessfullyAndIssueOtpChallenge() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "John Doe",
                TEST_USERNAME,
                TEST_HTNO,
                TEST_PASSWORD,
                TEST_PASSWORD
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is(TEST_EMAIL)))
                .andExpect(jsonPath("$.data.username", is(TEST_USERNAME)))
                .andExpect(jsonPath("$.data.htno", is(TEST_HTNO)))
                .andExpect(jsonPath("$.data.verificationRequired", is(true)));

        // Verify database user record
        Optional<User> savedUser = userRepository.findByEmail(TEST_EMAIL);
        assertThat(savedUser).isPresent();
        User user = savedUser.get();
        assertThat(user.getRole()).isEqualTo(Role.STUDENT);
        assertThat(user.isEmailVerified()).isFalse();
        assertThat(user.isEnabled()).isTrue();
        assertThat(user.getFullName()).isEqualTo("John Doe");
        assertThat(user.getUsername()).isEqualTo(TEST_USERNAME);
        assertThat(user.getHtno()).isEqualTo(TEST_HTNO);
        assertThat(user.getAdmissionYear()).isEqualTo(2023);
        assertThat(user.getYearOfStudy()).isEqualTo(4);
        assertThat(user.getRegulation()).isEqualTo("R21");
        assertThat(passwordEncoder.matches(TEST_PASSWORD, user.getPasswordHash())).isTrue();

        // Verify OTP challenge was created in database
        Optional<EmailVerificationChallenge> challengeOpt = challengeRepository.findTopByEmailOrderByIdDesc(TEST_EMAIL);
        assertThat(challengeOpt).isPresent();
        EmailVerificationChallenge challenge = challengeOpt.get();
        assertThat(challenge.isConsumed()).isFalse();
        assertThat(challenge.isExpired()).isFalse();
        assertThat(challenge.getAttempts()).isZero();
        assertThat(challenge.getResendCount()).isZero();
    }

    @Test
    @DisplayName("Unverified student login should be rejected with 403 Forbidden")
    void shouldRejectUnverifiedStudentLogin() throws Exception {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();
        User unverifiedStudent = new User(
                TEST_EMAIL,
                passwordEncoder.encode(TEST_PASSWORD),
                Role.STUDENT,
                2023,
                "R21",
                4,
                cse,
                TEST_HTNO
        );
        unverifiedStudent.setUsername(TEST_USERNAME);
        unverifiedStudent.setFullName("Test Student");
        unverifiedStudent.setEmailVerified(false);
        userRepository.save(unverifiedStudent);

        LoginRequest loginRequest = new LoginRequest(TEST_EMAIL, TEST_PASSWORD);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("OTP verification should succeed with correct OTP and enable login")
    void shouldVerifyOtpSuccessfullyAndAllowLogin() throws Exception {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();
        User student = new User(
                TEST_EMAIL,
                passwordEncoder.encode(TEST_PASSWORD),
                Role.STUDENT,
                2023,
                "R21",
                4,
                cse,
                TEST_HTNO
        );
        student.setUsername(TEST_USERNAME);
        student.setFullName("Test Student");
        student.setEmailVerified(false);
        User savedStudent = userRepository.save(student);

        String rawOtp = "123456";
        EmailVerificationChallenge challenge = new EmailVerificationChallenge(
                savedStudent,
                TEST_EMAIL,
                passwordEncoder.encode(rawOtp),
                LocalDateTime.now().plusMinutes(3)
        );
        challengeRepository.save(challenge);

        // Verify OTP
        VerifyOtpRequest verifyRequest = new VerifyOtpRequest(TEST_EMAIL, rawOtp);
        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // User should now be emailVerified = true
        User updatedUser = userRepository.findByEmail(TEST_EMAIL).orElseThrow();
        assertThat(updatedUser.isEmailVerified()).isTrue();

        // Login should now succeed
        LoginRequest loginRequest = new LoginRequest(TEST_EMAIL, TEST_PASSWORD);
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is(TEST_EMAIL)))
                .andExpect(jsonPath("$.data.user.emailVerified", is(true)));
    }

    @Test
    @DisplayName("OTP verification should fail on incorrect OTP and track remaining attempts")
    void shouldTrackOtpAttempts() throws Exception {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();
        User student = new User(
                TEST_EMAIL,
                passwordEncoder.encode(TEST_PASSWORD),
                Role.STUDENT,
                2023,
                "R21",
                4,
                cse,
                TEST_HTNO
        );
        student.setEmailVerified(false);
        User savedStudent = userRepository.save(student);

        String rawOtp = "654321";
        EmailVerificationChallenge challenge = new EmailVerificationChallenge(
                savedStudent,
                TEST_EMAIL,
                passwordEncoder.encode(rawOtp),
                LocalDateTime.now().plusMinutes(3)
        );
        challengeRepository.save(challenge);

        // Send wrong OTP
        VerifyOtpRequest wrongRequest = new VerifyOtpRequest(TEST_EMAIL, "111111");
        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));

        EmailVerificationChallenge updatedChallenge = challengeRepository.findTopByEmailOrderByIdDesc(TEST_EMAIL).orElseThrow();
        assertThat(updatedChallenge.getAttempts()).isEqualTo(1);
    }

    @Test
    @DisplayName("Resend OTP should enforce 60-second cooldown")
    void shouldEnforceResendCooldown() throws Exception {
        Department cse = departmentRepository.findByCode("CSE").orElseThrow();
        User student = new User(
                TEST_EMAIL,
                passwordEncoder.encode(TEST_PASSWORD),
                Role.STUDENT,
                2023,
                "R21",
                4,
                cse,
                TEST_HTNO
        );
        student.setEmailVerified(false);
        User savedStudent = userRepository.save(student);

        EmailVerificationChallenge challenge = new EmailVerificationChallenge(
                savedStudent,
                TEST_EMAIL,
                passwordEncoder.encode("123456"),
                LocalDateTime.now().plusMinutes(3)
        );
        challenge.setLastSentAt(LocalDateTime.now()); // Just sent
        challengeRepository.save(challenge);

        ResendOtpRequest resendRequest = new ResendOtpRequest(TEST_EMAIL);
        mockMvc.perform(post("/api/v1/auth/resend-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resendRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("Existing ADMIN and MODERATOR logins continue to work without student email verification barrier")
    void shouldAllowAdminAndModeratorLogin() throws Exception {
        // Ensure admin and moderator exist with known password
        User admin = userRepository.findByEmail("admin@mlrit.ac.in").orElseGet(() -> {
            User u = new User("admin@mlrit.ac.in", passwordEncoder.encode(TEST_PASSWORD), Role.ADMIN);
            return userRepository.save(u);
        });
        admin.setPasswordHash(passwordEncoder.encode(TEST_PASSWORD));
        userRepository.save(admin);

        User mod = userRepository.findByEmail("moderator@mlrit.ac.in").orElseGet(() -> {
            User u = new User("moderator@mlrit.ac.in", passwordEncoder.encode(TEST_PASSWORD), Role.MODERATOR);
            return userRepository.save(u);
        });
        mod.setPasswordHash(passwordEncoder.encode(TEST_PASSWORD));
        userRepository.save(mod);

        // ADMIN login
        LoginRequest adminLogin = new LoginRequest("admin@mlrit.ac.in", TEST_PASSWORD);
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.role", is("ADMIN")));

        // MODERATOR login
        LoginRequest modLogin = new LoginRequest("moderator@mlrit.ac.in", TEST_PASSWORD);
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(modLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.role", is("MODERATOR")));
    }

    @Test
    @DisplayName("Registration cannot be manipulated with malicious role escalation or custom academic fields")
    void shouldRejectRoleEscalationAndIgnoreAcademicOverrides() throws Exception {
        String maliciousPayload = "{\n" +
                "    \"fullName\": \"Hacker User\",\n" +
                "    \"username\": \"hacker_pro\",\n" +
                "    \"htno\": \"24R25A0402\",\n" +
                "    \"password\": \"Password@123\",\n" +
                "    \"confirmPassword\": \"Password@123\",\n" +
                "    \"role\": \"ADMIN\",\n" +
                "    \"department\": \"CIVIL\",\n" +
                "    \"admissionYear\": 2020,\n" +
                "    \"yearOfStudy\": 1,\n" +
                "    \"email\": \"admin@campusnexus.com\"\n" +
                "}";

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(maliciousPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.email", is("24r25a0402@mlrit.ac.in")));

        User saved = userRepository.findByEmail("24r25a0402@mlrit.ac.in").orElseThrow();
        assertThat(saved.getRole()).isEqualTo(Role.STUDENT);
        assertThat(saved.getAdmissionYear()).isEqualTo(2024); // Derived from 24 in HTNO
        assertThat(saved.getYearOfStudy()).isEqualTo(3); // 2024 cohort -> 3rd year
    }

    @Test
    @DisplayName("Complete end-to-end: Register -> Unverified login 403 -> Password Reset preserves unverified -> Verify OTP -> Login succeeds with Email & Username")
    void shouldDemonstrateCompleteVerificationAndResetSeparationWorkflow() throws Exception {
        // 1. Register student
        RegisterRequest registerRequest = new RegisterRequest(
                "Uday Teja Test",
                TEST_USERNAME,
                TEST_HTNO,
                "OldPassword@123",
                "OldPassword@123"
        );
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is(TEST_EMAIL)));

        User userAfterReg = userRepository.findByEmail(TEST_EMAIL).orElseThrow();
        assertThat(userAfterReg.isEmailVerified()).isFalse();

        // 2. Unverified login attempt rejected with 403
        LoginRequest unverifiedLogin = new LoginRequest(TEST_EMAIL, "OldPassword@123");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unverifiedLogin)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", is("Institutional email is not verified. Please verify your email before logging in.")));

        // 3. Password reset request
        ForgotPasswordRequest forgotReq = new ForgotPasswordRequest(TEST_EMAIL);
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(forgotReq)))
                .andExpect(status().isOk());

        // Get the password reset challenge
        PasswordResetChallenge prc = resetChallengeRepository.findTopByEmailOrderByIdDesc(TEST_EMAIL).orElseThrow();
        // Simulate known reset code
        String resetCode = "654321";
        prc.setOtpHash(passwordEncoder.encode(resetCode));
        resetChallengeRepository.save(prc);

        // 4. Perform password reset
        ResetPasswordRequest resetReq = new ResetPasswordRequest(
                TEST_EMAIL,
                resetCode,
                TEST_PASSWORD,
                TEST_PASSWORD
        );
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Password has been reset successfully. You can now log in with your new password.")));

        // User must STILL be unverified
        User userAfterReset = userRepository.findByEmail(TEST_EMAIL).orElseThrow();
        assertThat(userAfterReset.isEmailVerified()).isFalse();

        // 5. Login with new password is STILL rejected with 403
        LoginRequest newPwdLogin = new LoginRequest(TEST_EMAIL, TEST_PASSWORD);
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newPwdLogin)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", is("Institutional email is not verified. Please verify your email before logging in.")));

        // 6. Complete Email Verification
        EmailVerificationChallenge evc = challengeRepository.findTopByEmailOrderByIdDesc(TEST_EMAIL).orElseThrow();
        String verifyCode = "123456";
        evc.setOtpHash(passwordEncoder.encode(verifyCode));
        challengeRepository.save(evc);

        VerifyOtpRequest verifyReq = new VerifyOtpRequest(TEST_EMAIL, verifyCode);
        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // User must NOW be verified
        User userAfterVerify = userRepository.findByEmail(TEST_EMAIL).orElseThrow();
        assertThat(userAfterVerify.isEmailVerified()).isTrue();
        EmailVerificationChallenge evcConsumed = challengeRepository.findTopByEmailOrderByIdDesc(TEST_EMAIL).orElseThrow();
        assertThat(evcConsumed.isConsumed()).isTrue();

        // 7. Login with Email + New Password succeeds
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(TEST_EMAIL, TEST_PASSWORD))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is(TEST_EMAIL)))
                .andExpect(jsonPath("$.data.user.emailVerified", is(true)));

        // 8. Login with Username + New Password succeeds
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(TEST_USERNAME, TEST_PASSWORD))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.user.username", is(TEST_USERNAME)))
                .andExpect(jsonPath("$.data.user.emailVerified", is(true)));
    }
}
