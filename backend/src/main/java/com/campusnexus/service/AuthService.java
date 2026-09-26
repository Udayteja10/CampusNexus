package com.campusnexus.service;

import com.campusnexus.dto.AuthResponse;
import com.campusnexus.dto.ForgotPasswordRequest;
import com.campusnexus.dto.HtnoValidationResponse;
import com.campusnexus.dto.LoginRequest;
import com.campusnexus.dto.RegisterRequest;
import com.campusnexus.dto.RegisterResponse;
import com.campusnexus.dto.ResendOtpRequest;
import com.campusnexus.dto.ResetPasswordRequest;
import com.campusnexus.dto.UserDto;
import com.campusnexus.dto.UsernameAvailabilityResponse;
import com.campusnexus.dto.VerifyOtpRequest;
import com.campusnexus.dto.VerifyResetCodeRequest;
import com.campusnexus.entity.Department;
import com.campusnexus.entity.EmailVerificationChallenge;
import com.campusnexus.entity.PasswordResetChallenge;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.EmailVerificationChallengeRepository;
import com.campusnexus.repository.PasswordResetChallengeRepository;
import com.campusnexus.repository.UserRepository;
import com.campusnexus.security.JwtService;
import com.campusnexus.util.HtnoUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-z0-9_]{3,20}$");
    private static final Set<String> RESERVED_USERNAMES = Set.of(
            "admin", "administrator", "moderator", "mod", "support",
            "system", "sysadmin", "root", "campusnexus", "nexus",
            "official", "helpdesk", "staff", "faculty", "security",
            "superuser", "user", "guest", "null", "undefined", "api"
    );

    private static final int OTP_VALIDITY_MINUTES = 3;
    private static final int RESET_OTP_VALIDITY_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 5;
    private static final int MAX_RESENDS = 3;
    private static final int RESEND_COOLDOWN_SECONDS = 60;

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final EmailVerificationChallengeRepository challengeRepository;
    private final PasswordResetChallengeRepository resetChallengeRepository;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            EmailVerificationChallengeRepository challengeRepository,
            PasswordResetChallengeRepository resetChallengeRepository,
            AuditLogService auditLogService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.challengeRepository = challengeRepository;
        this.resetChallengeRepository = resetChallengeRepository;
        this.auditLogService = auditLogService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public UsernameAvailabilityResponse checkUsernameAvailability(String rawUsername) {
        if (rawUsername == null || rawUsername.isBlank()) {
            return new UsernameAvailabilityResponse(rawUsername, false, "Username cannot be empty.");
        }

        String username = rawUsername.trim().toLowerCase();

        if (!USERNAME_PATTERN.matcher(username).matches()) {
            return new UsernameAvailabilityResponse(
                    username,
                    false,
                    "Username must be 3-20 characters long and contain only lowercase letters, numbers, or underscores."
            );
        }

        if (RESERVED_USERNAMES.contains(username)) {
            return new UsernameAvailabilityResponse(username, false, "This username is reserved.");
        }

        boolean taken = userRepository.existsByUsernameIgnoreCase(username);
        if (taken) {
            return new UsernameAvailabilityResponse(username, false, "Username is already taken.");
        }

        return new UsernameAvailabilityResponse(username, true, "Username is available.");
    }

    @Transactional(readOnly = true)
    public HtnoValidationResponse validateHtno(String rawHtno) {
        if (rawHtno == null || rawHtno.isBlank()) {
            return new HtnoValidationResponse(null, false, false, null, null, null, null, null, "HTNO cannot be empty.");
        }

        String normalized = HtnoUtils.normalize(rawHtno);
        try {
            HtnoUtils.HtnoMetadata meta = HtnoUtils.parseAndValidate(normalized);

            boolean exists = userRepository.existsByHtno(meta.htno()) || userRepository.existsByEmail(meta.institutionalEmail());
            if (exists) {
                return new HtnoValidationResponse(
                        meta.htno(),
                        true,
                        false,
                        meta.admissionYear(),
                        meta.yearOfStudy(),
                        meta.regulation(),
                        meta.departmentCode(),
                        meta.institutionalEmail(),
                        "An account with this HTNO or institutional email already exists."
                );
            }

            return new HtnoValidationResponse(
                    meta.htno(),
                    true,
                    true,
                    meta.admissionYear(),
                    meta.yearOfStudy(),
                    meta.regulation(),
                    meta.departmentCode(),
                    meta.institutionalEmail(),
                    "HTNO is valid and available."
                );
        } catch (IllegalArgumentException e) {
            return new HtnoValidationResponse(normalized, false, false, null, null, null, null, null, e.getMessage());
        }
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request, String ipAddress, String userAgent) {
        log.debug("Processing student registration for htno: {}", request.htno());

        if (request.confirmPassword() != null && !request.confirmPassword().isBlank()) {
            if (!request.password().equals(request.confirmPassword())) {
                throw new IllegalArgumentException("Passwords do not match.");
            }
        }

        String rawUsername = request.username();
        if (rawUsername == null || rawUsername.isBlank()) {
            throw new IllegalArgumentException("Username is required.");
        }
        String username = rawUsername.trim().toLowerCase();
        if (!USERNAME_PATTERN.matcher(username).matches()) {
            throw new IllegalArgumentException("Username must be 3-20 characters long and contain only lowercase letters, numbers, or underscores.");
        }
        if (RESERVED_USERNAMES.contains(username)) {
            throw new IllegalArgumentException("Username is reserved.");
        }
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username is already taken.");
        }

        HtnoUtils.HtnoMetadata meta = HtnoUtils.parseAndValidate(request.htno());

        if (userRepository.existsByHtno(meta.htno())) {
            throw new IllegalArgumentException("An account with this HTNO already exists.");
        }
        if (userRepository.existsByEmail(meta.institutionalEmail())) {
            throw new IllegalArgumentException("An account with this institutional email already exists.");
        }

        Department department = departmentRepository.findByCodeIgnoreCase(meta.departmentCode())
                .orElse(null);

        String encodedPassword = passwordEncoder.encode(request.password());

        // Public registration STRICTLY creates STUDENT role.
        User user = new User();
        user.setEmail(meta.institutionalEmail());
        user.setPasswordHash(encodedPassword);
        user.setRole(Role.STUDENT);
        user.setFullName(request.fullName() != null ? request.fullName().trim() : null);
        user.setUsername(username);
        user.setHtno(meta.htno());
        user.setAdmissionYear(meta.admissionYear());
        user.setYearOfStudy(meta.yearOfStudy());
        user.setRegulation(meta.regulation());
        user.setDepartment(department);
        user.setEnabled(true);
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);

        // Generate 6-digit cryptographically secure OTP
        String otp = generateSixDigitOtp();
        String otpHash = passwordEncoder.encode(otp);

        EmailVerificationChallenge challenge = new EmailVerificationChallenge(
                savedUser,
                savedUser.getEmail(),
                otpHash,
                LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES)
        );
        challengeRepository.save(challenge);

        // Dispatch verification email (OTP is never logged)
        emailService.sendVerificationOtp(savedUser.getEmail(), savedUser.getFullName(), otp, OTP_VALIDITY_MINUTES);

        auditLogService.logEvent(
                savedUser,
                "REGISTRATION",
                "USER",
                savedUser.getId().toString(),
                ipAddress,
                userAgent,
                "{\"email\":\"" + savedUser.getEmail() + "\",\"htno\":\"" + savedUser.getHtno() + "\"}"
        );

        return new RegisterResponse(
                savedUser.getEmail(),
                savedUser.getUsername(),
                savedUser.getHtno(),
                "Registration successful. Please enter the 6-digit verification code sent to your institutional email.",
                true
        );
    }

    @Transactional(noRollbackFor = {BadCredentialsException.class})
    public void verifyOtp(VerifyOtpRequest request, String ipAddress, String userAgent) {
        String identifier = request.email().trim().toLowerCase();
        String rawOtp = request.otp().trim();

        Optional<User> userOpt = userRepository.findByEmail(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsernameIgnoreCase(identifier);
        }
        User user = userOpt.orElseThrow(() -> new IllegalArgumentException("No account found with identifier: " + identifier));

        if (user.isEmailVerified()) {
            return; // Already verified
        }

        EmailVerificationChallenge challenge = challengeRepository.findTopByEmailOrderByIdDesc(user.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No verification challenge found for this email."));

        if (challenge.isConsumed()) {
            throw new IllegalArgumentException("This verification code has already been used. Please request a new code.");
        }

        if (challenge.isExpired()) {
            throw new IllegalArgumentException("Verification code has expired. Please request a new code.");
        }

        if (challenge.getAttempts() >= MAX_ATTEMPTS) {
            auditLogService.logEvent(user, "EMAIL_VERIFICATION_FAILURE", "USER", user.getId().toString(), ipAddress, userAgent, "{\"reason\":\"max_attempts_exceeded\"}");
            throw new IllegalArgumentException("Maximum verification attempts exceeded. Please request a new code.");
        }

        if (!passwordEncoder.matches(rawOtp, challenge.getOtpHash())) {
            challenge.setAttempts(challenge.getAttempts() + 1);
            challengeRepository.save(challenge);

            auditLogService.logEvent(user, "EMAIL_VERIFICATION_FAILURE", "USER", user.getId().toString(), ipAddress, userAgent, "{\"reason\":\"invalid_otp\",\"attempt\":" + challenge.getAttempts() + "}");

            int remaining = MAX_ATTEMPTS - challenge.getAttempts();
            if (remaining <= 0) {
                throw new BadCredentialsException("Invalid verification code. Maximum attempts reached. Please request a new code.");
            } else {
                throw new BadCredentialsException("Invalid verification code. " + remaining + " attempt(s) remaining.");
            }
        }

        // Success
        challenge.setConsumedAt(LocalDateTime.now());
        challengeRepository.save(challenge);

        user.setEmailVerified(true);
        userRepository.save(user);

        auditLogService.logEvent(user, "EMAIL_VERIFICATION_SUCCESS", "USER", user.getId().toString(), ipAddress, userAgent, "{\"email\":\"" + user.getEmail() + "\"}");
    }

    @Transactional
    public String resendOtp(ResendOtpRequest request) {
        String identifier = request.email().trim().toLowerCase();

        Optional<User> userOpt = userRepository.findByEmail(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsernameIgnoreCase(identifier);
        }
        User user = userOpt.orElseThrow(() -> new IllegalArgumentException("No account found with identifier: " + identifier));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Email is already verified.");
        }

        Optional<EmailVerificationChallenge> latestChallengeOpt = challengeRepository.findTopByEmailOrderByIdDesc(user.getEmail());

        int currentResendCount = 0;
        if (latestChallengeOpt.isPresent()) {
            EmailVerificationChallenge latest = latestChallengeOpt.get();
            currentResendCount = latest.getResendCount();

            // Check 60-second cooldown
            if (latest.getLastSentAt() != null &&
                    latest.getLastSentAt().plusSeconds(RESEND_COOLDOWN_SECONDS).isAfter(LocalDateTime.now())) {
                throw new IllegalArgumentException("Please wait 60 seconds before requesting a new code.");
            }

            // Check max 3 resends
            if (currentResendCount >= MAX_RESENDS) {
                throw new IllegalArgumentException("Maximum resend attempts reached (3). Please contact support.");
            }

            // Invalidate the old challenge
            if (!latest.isConsumed()) {
                latest.setConsumedAt(LocalDateTime.now());
                challengeRepository.save(latest);
            }
        }

        int newResendCount = currentResendCount + 1;
        String newOtp = generateSixDigitOtp();
        String newOtpHash = passwordEncoder.encode(newOtp);

        EmailVerificationChallenge newChallenge = new EmailVerificationChallenge(
                user,
                user.getEmail(),
                newOtpHash,
                LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES)
        );
        newChallenge.setResendCount(newResendCount);
        newChallenge.setLastSentAt(LocalDateTime.now());
        challengeRepository.save(newChallenge);

        // Send OTP
        emailService.sendVerificationOtp(user.getEmail(), user.getFullName(), newOtp, OTP_VALIDITY_MINUTES);

        int remainingResends = MAX_RESENDS - newResendCount;
        return "New verification code sent. Resends remaining: " + remainingResends;
    }

    @Transactional(noRollbackFor = {BadCredentialsException.class, DisabledException.class})
    public AuthResponse login(LoginRequest request, String ipAddress, String userAgent) {
        String identifier = request.email().trim().toLowerCase();
        log.debug("Processing login for identifier: {}", identifier);

        Optional<User> userOpt = userRepository.findByEmail(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsernameIgnoreCase(identifier);
        }

        if (userOpt.isEmpty()) {
            auditLogService.logEvent((User) null, "LOGIN_FAILURE", "AUTH", null, ipAddress, userAgent, "{\"identifier\":\"" + identifier + "\",\"reason\":\"user_not_found\"}");
            throw new BadCredentialsException("Invalid email or password.");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            auditLogService.logEvent(user, "LOGIN_FAILURE", "AUTH", user.getId().toString(), ipAddress, userAgent, "{\"reason\":\"invalid_password\"}");
            throw new BadCredentialsException("Invalid email or password.");
        }

        if (!user.isEnabled()) {
            auditLogService.logEvent(user, "LOGIN_FAILURE", "AUTH", user.getId().toString(), ipAddress, userAgent, "{\"reason\":\"account_disabled\"}");
            throw new DisabledException("Account is disabled. Please contact administrator.");
        }

        if (user.getRole() == Role.STUDENT && !user.isEmailVerified()) {
            auditLogService.logEvent(user, "LOGIN_FAILURE", "AUTH", user.getId().toString(), ipAddress, userAgent, "{\"reason\":\"email_not_verified\"}");
            throw new DisabledException("Institutional email is not verified. Please verify your email before logging in.");
        }

        auditLogService.logEvent(user, "LOGIN_SUCCESS", "AUTH", user.getId().toString(), ipAddress, userAgent, "{\"role\":\"" + user.getRole().name() + "\"}");

        String token = jwtService.generateToken(user);
        return AuthResponse.of(token, jwtService.getExpirationMs(), UserDto.fromEntity(user));
    }

    // ─── PART 1: PASSWORD RESET WORKFLOW ──────────────────────────────────────

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request, String ipAddress, String userAgent) {
        String genericMsg = "If an account exists, a password reset instruction has been sent.";
        if (request.email() == null || request.email().isBlank()) {
            return genericMsg;
        }

        String identifier = request.email().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsernameIgnoreCase(identifier);
        }

        if (userOpt.isEmpty()) {
            auditLogService.logEvent((User) null, "PASSWORD_RESET_REQUEST", "USER", null, ipAddress, userAgent, "{\"identifier\":\"" + identifier + "\",\"result\":\"user_not_found\"}");
            return genericMsg; // Prevent account enumeration
        }

        User user = userOpt.get();

        // Check active challenges cooldown (60 seconds) and invalidation
        Optional<PasswordResetChallenge> latestOpt = resetChallengeRepository.findTopByEmailOrderByIdDesc(user.getEmail());
        int currentResends = 0;
        if (latestOpt.isPresent()) {
            PasswordResetChallenge latest = latestOpt.get();
            currentResends = latest.getResendCount();

            if (latest.getLastSentAt() != null &&
                    latest.getLastSentAt().plusSeconds(RESEND_COOLDOWN_SECONDS).isAfter(LocalDateTime.now())) {
                throw new IllegalArgumentException("Please wait 60 seconds before requesting another reset code.");
            }

            if (currentResends >= MAX_RESENDS) {
                throw new IllegalArgumentException("Maximum password reset requests reached. Please try again later.");
            }

            // Invalidate all previous unconsumed reset challenges for this email
            List<PasswordResetChallenge> unconsumed = resetChallengeRepository.findAllByEmailAndConsumedAtIsNull(user.getEmail());
            for (PasswordResetChallenge ch : unconsumed) {
                ch.setConsumedAt(LocalDateTime.now());
                resetChallengeRepository.save(ch);
            }
        }

        // Generate 6-digit cryptographically secure OTP
        String otp = generateSixDigitOtp();
        String otpHash = passwordEncoder.encode(otp);

        PasswordResetChallenge challenge = new PasswordResetChallenge(
                user,
                user.getEmail(),
                otpHash,
                LocalDateTime.now().plusMinutes(RESET_OTP_VALIDITY_MINUTES)
        );
        challenge.setResendCount(currentResends + 1);
        challenge.setLastSentAt(LocalDateTime.now());
        resetChallengeRepository.save(challenge);

        // Dispatch reset email (never log OTP)
        try {
            emailService.sendPasswordResetOtp(user.getEmail(), user.getFullName(), otp, RESET_OTP_VALIDITY_MINUTES);
        } catch (com.campusnexus.exception.EmailDeliveryException ex) {
            log.error("Failed to deliver password reset email during forgot-password request for user: {}", user.getId());
            // Intentionally swallow exception to preserve account enumeration protection
        }

        auditLogService.logEvent(user, "PASSWORD_RESET_REQUEST", "USER", user.getId().toString(), ipAddress, userAgent, "{\"email\":\"" + user.getEmail() + "\"}");

        return genericMsg;
    }

    @Transactional(noRollbackFor = {BadCredentialsException.class})
    public String verifyResetCode(VerifyResetCodeRequest request, String ipAddress, String userAgent) {
        String email = request.email().trim().toLowerCase();
        String rawCode = request.code().trim();

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsernameIgnoreCase(email);
        }

        if (userOpt.isEmpty()) {
            throw new BadCredentialsException("Invalid email or verification code.");
        }

        User user = userOpt.get();

        PasswordResetChallenge challenge = resetChallengeRepository.findTopByEmailOrderByIdDesc(user.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired verification code."));

        if (challenge.isConsumed()) {
            throw new BadCredentialsException("This verification code has already been used. Please request a new code.");
        }

        if (challenge.isExpired()) {
            throw new BadCredentialsException("Verification code has expired. Please request a new code.");
        }

        if (challenge.getAttempts() >= MAX_ATTEMPTS) {
            auditLogService.logEvent(user, "PASSWORD_RESET_FAILURE", "USER", user.getId().toString(), ipAddress, userAgent, "{\"reason\":\"max_attempts_exceeded\"}");
            throw new BadCredentialsException("Maximum verification attempts exceeded. Please request a new code.");
        }

        if (!passwordEncoder.matches(rawCode, challenge.getOtpHash())) {
            challenge.setAttempts(challenge.getAttempts() + 1);
            resetChallengeRepository.save(challenge);

            auditLogService.logEvent(user, "PASSWORD_RESET_FAILURE", "USER", user.getId().toString(), ipAddress, userAgent, "{\"reason\":\"invalid_code\",\"attempt\":" + challenge.getAttempts() + "}");

            int remaining = MAX_ATTEMPTS - challenge.getAttempts();
            if (remaining <= 0) {
                throw new BadCredentialsException("Invalid verification code. Maximum attempts reached. Please request a new code.");
            } else {
                throw new BadCredentialsException("Invalid verification code. " + remaining + " attempt(s) remaining.");
            }
        }

        return "Verification code is valid.";
    }

    @Transactional
    public String resetPassword(ResetPasswordRequest request, String ipAddress, String userAgent) {
        if (request.confirmPassword() != null && !request.confirmPassword().isBlank()) {
            if (!request.newPassword().equals(request.confirmPassword())) {
                throw new IllegalArgumentException("Passwords do not match.");
            }
        }

        if (request.newPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long.");
        }

        String email = request.email().trim().toLowerCase();
        String rawCode = request.code().trim();

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsernameIgnoreCase(email);
        }

        if (userOpt.isEmpty()) {
            throw new BadCredentialsException("Invalid email or verification code.");
        }

        User user = userOpt.get();

        PasswordResetChallenge challenge = resetChallengeRepository.findTopByEmailOrderByIdDesc(user.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired verification code."));

        if (challenge.isConsumed()) {
            throw new BadCredentialsException("This verification code has already been used. Please request a new code.");
        }

        if (challenge.isExpired()) {
            throw new BadCredentialsException("Verification code has expired. Please request a new code.");
        }

        if (challenge.getAttempts() >= MAX_ATTEMPTS) {
            throw new BadCredentialsException("Maximum verification attempts exceeded. Please request a new code.");
        }

        if (!passwordEncoder.matches(rawCode, challenge.getOtpHash())) {
            challenge.setAttempts(challenge.getAttempts() + 1);
            resetChallengeRepository.save(challenge);
            throw new BadCredentialsException("Invalid verification code.");
        }

        // Successfully verified — update password
        String newHash = passwordEncoder.encode(request.newPassword());
        user.setPasswordHash(newHash);
        userRepository.save(user);

        // Mark challenge consumed
        challenge.setConsumedAt(LocalDateTime.now());
        resetChallengeRepository.save(challenge);

        auditLogService.logEvent(user, "PASSWORD_RESET_SUCCESS", "USER", user.getId().toString(), ipAddress, userAgent, "{\"email\":\"" + user.getEmail() + "\"}");

        return "Password has been reset successfully. You can now log in with your new password.";
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return UserDto.fromEntity(user);
    }

    private String generateSixDigitOtp() {
        int code = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(code);
    }
}
