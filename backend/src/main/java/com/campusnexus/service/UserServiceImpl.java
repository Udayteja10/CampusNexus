package com.campusnexus.service;

import com.campusnexus.dto.UpdateProfileRequest;
import com.campusnexus.dto.UserDto;
import com.campusnexus.entity.User;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.regex.Pattern;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-z0-9_]{3,20}$");
    private static final Set<String> RESERVED_USERNAMES = Set.of(
            "admin", "administrator", "moderator", "mod", "support",
            "system", "sysadmin", "root", "campusnexus", "nexus",
            "official", "helpdesk", "staff", "faculty", "security",
            "superuser", "user", "guest", "null", "undefined", "api"
    );

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public UserServiceImpl(UserRepository userRepository, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return UserDto.fromEntity(user);
    }

    @Override
    @Transactional
    public UserDto updateProfile(String currentEmail, UpdateProfileRequest request, String ipAddress, String userAgent) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentEmail));

        boolean modified = false;

        // 1. Update Full Name
        if (request.fullName() != null) {
            String trimmedName = request.fullName().trim();
            if (trimmedName.length() < 2 || trimmedName.length() > 100) {
                throw new IllegalArgumentException("Full name must be between 2 and 100 characters.");
            }
            if (!trimmedName.equals(user.getFullName())) {
                user.setFullName(trimmedName);
                modified = true;
            }
        }

        // 2. Update Username (with format, reserved, and case-insensitive uniqueness check)
        if (request.username() != null) {
            String newUsername = request.username().trim().toLowerCase();
            if (!newUsername.equals(user.getUsername())) {
                if (!USERNAME_PATTERN.matcher(newUsername).matches()) {
                    throw new IllegalArgumentException("Username must be 3-20 characters long and contain only lowercase letters, numbers, or underscores.");
                }
                if (RESERVED_USERNAMES.contains(newUsername)) {
                    throw new IllegalArgumentException("This username is reserved.");
                }
                if (userRepository.existsByUsernameIgnoreCase(newUsername)) {
                    throw new IllegalArgumentException("Username is already taken.");
                }

                String oldUsername = user.getUsername();
                user.setUsername(newUsername);
                modified = true;

                auditLogService.logEvent(
                        user,
                        "USERNAME_CHANGE",
                        "USER",
                        user.getId().toString(),
                        ipAddress,
                        userAgent,
                        "{\"oldUsername\":\"" + oldUsername + "\",\"newUsername\":\"" + newUsername + "\"}"
                );
            }
        }

        if (modified) {
            user = userRepository.save(user);
            log.info("Profile updated for userId={}", user.getId());
            auditLogService.logEvent(
                    user,
                    "PROFILE_UPDATE",
                    "USER",
                    user.getId().toString(),
                    ipAddress,
                    userAgent,
                    "{\"updatedFields\":\"fullName,username\"}"
            );
        }

        return UserDto.fromEntity(user);
    }
}
