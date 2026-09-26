package com.campusnexus.dto;

import com.campusnexus.entity.AuditLog;

import java.time.LocalDateTime;

public record AuditLogResponseDto(
        Long id,
        Long userId,
        String userEmail,
        String userFullName,
        String userRole,
        String action,
        String targetType,
        String targetId,
        String ipAddress,
        String userAgent,
        String metadata,
        LocalDateTime createdAt
) {
    public static AuditLogResponseDto fromEntity(AuditLog log) {
        Long uId = null;
        String email = null;
        String fullName = null;
        String role = null;

        if (log.getUser() != null) {
            uId = log.getUser().getId();
            email = log.getUser().getEmail();
            fullName = log.getUser().getFullName();
            role = log.getUser().getRole() != null ? log.getUser().getRole().name() : null;
        }

        return new AuditLogResponseDto(
                log.getId(),
                uId,
                email,
                fullName,
                role,
                log.getAction(),
                log.getTargetType(),
                log.getTargetId(),
                log.getIpAddress(),
                log.getUserAgent(),
                log.getMetadata(),
                log.getCreatedAt()
        );
    }
}
