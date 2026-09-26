package com.campusnexus.service;

import com.campusnexus.dto.AdminUserDto;
import com.campusnexus.dto.UpdateUserRoleRequest;
import com.campusnexus.dto.UpdateUserStatusRequest;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminUserServiceImpl implements AdminUserService {

    private static final Logger log = LoggerFactory.getLogger(AdminUserServiceImpl.class);

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public AdminUserServiceImpl(UserRepository userRepository, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUserDto> getAdminUsers(String rawSearch, Role role, String rawStatus, Pageable pageable) {
        String search = (rawSearch != null && !rawSearch.isBlank()) ? rawSearch.trim() : null;

        Boolean enabled = null;
        Boolean emailVerified = null;

        if (rawStatus != null && !rawStatus.isBlank() && !"ALL".equalsIgnoreCase(rawStatus.trim())) {
            String status = rawStatus.trim().toUpperCase();
            if ("ACTIVE".equals(status)) {
                enabled = true;
            } else if ("SUSPENDED".equals(status) || "RESTRICTED".equals(status)) {
                enabled = false;
            } else if ("UNVERIFIED".equals(status)) {
                emailVerified = false;
            }
        }

        return userRepository.findAdminUsers(role, enabled, emailVerified, search, pageable)
                .map(AdminUserDto::fromEntity);
    }

    @Override
    @Transactional
    public AdminUserDto updateUserStatus(Long userId, UpdateUserStatusRequest request, String actorEmail, String ipAddress, String userAgent) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        User actor = userRepository.findByEmail(actorEmail)
                .or(() -> userRepository.findByUsernameIgnoreCase(actorEmail))
                .orElseThrow(() -> new ResourceNotFoundException("Actor not found: " + actorEmail));

        // Moderator cannot modify Admin account
        if (actor.getRole() == Role.MODERATOR && targetUser.getRole() == Role.ADMIN) {
            throw new AccessDeniedException("Moderators cannot modify Administrator accounts.");
        }

        String status = request.status().trim().toUpperCase();
        boolean newEnabled = "ACTIVE".equals(status);
        targetUser.setEnabled(newEnabled);
        User savedUser = userRepository.save(targetUser);

        String action = newEnabled ? "USER_RESTORED" : "USER_SUSPENDED";
        String metadata = String.format("{\"previousStatus\":%b,\"newStatus\":%b,\"reason\":\"%s\"}",
                !newEnabled, newEnabled, request.reason() != null ? request.reason().trim() : "Admin status update");

        auditLogService.logEvent(actor, action, "USER", targetUser.getId().toString(), ipAddress, userAgent, metadata);
        log.info("Admin {} updated status of user {} to enabled={}", actorEmail, targetUser.getUsername(), newEnabled);

        return AdminUserDto.fromEntity(savedUser);
    }

    @Override
    @Transactional
    public AdminUserDto updateUserRole(Long userId, UpdateUserRoleRequest request, String actorEmail, String ipAddress, String userAgent) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        User actor = userRepository.findByEmail(actorEmail)
                .or(() -> userRepository.findByUsernameIgnoreCase(actorEmail))
                .orElseThrow(() -> new ResourceNotFoundException("Actor not found: " + actorEmail));

        // Only ADMIN can change roles
        if (actor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only Administrators can change user roles.");
        }

        Role prevRole = targetUser.getRole();
        Role newRole = request.role();
        targetUser.setRole(newRole);
        User savedUser = userRepository.save(targetUser);

        String metadata = String.format("{\"previousRole\":\"%s\",\"newRole\":\"%s\"}", prevRole.name(), newRole.name());
        auditLogService.logEvent(actor, "USER_ROLE_CHANGED", "USER", targetUser.getId().toString(), ipAddress, userAgent, metadata);
        log.info("Admin {} changed role of user {} from {} to {}", actorEmail, targetUser.getUsername(), prevRole, newRole);

        return AdminUserDto.fromEntity(savedUser);
    }
}
