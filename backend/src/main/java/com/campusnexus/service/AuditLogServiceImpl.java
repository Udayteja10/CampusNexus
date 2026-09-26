package com.campusnexus.service;

import com.campusnexus.dto.AuditLogResponseDto;
import com.campusnexus.entity.AuditLog;
import com.campusnexus.entity.User;
import com.campusnexus.repository.AuditLogRepository;
import com.campusnexus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogServiceImpl.class);

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void logEvent(User user, String action, String targetType, String targetId, String ipAddress, String userAgent, String metadata) {
        try {
            AuditLog auditLog = new AuditLog(
                    user,
                    action,
                    targetType,
                    targetId,
                    sanitizeString(ipAddress, 50),
                    sanitizeString(userAgent, 255),
                    sanitizeMetadata(metadata)
            );
            auditLogRepository.save(auditLog);
            log.info("Audit logged: action={}, user={}", action, user != null ? user.getEmail() : "ANONYMOUS");
        } catch (Exception e) {
            log.error("Failed to record audit log for action: {}", action, e);
        }
    }

    @Override
    @Transactional
    public void logEvent(Long userId, String action, String targetType, String targetId, String ipAddress, String userAgent, String metadata) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        logEvent(user, action, targetType, targetId, ipAddress, userAgent, metadata);
    }

    @Override
    @Transactional
    public void logEvent(String action, String targetType, String targetId, String metadata) {
        logEvent((User) null, action, targetType, targetId, null, null, metadata);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponseDto> getAuditLogs(String action, Long userId, Pageable pageable) {
        if (action != null && !action.isBlank()) {
            return auditLogRepository.findAllByActionOrderByCreatedAtDesc(action.trim(), pageable)
                    .map(AuditLogResponseDto::fromEntity);
        }
        if (userId != null) {
            return auditLogRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable)
                    .map(AuditLogResponseDto::fromEntity);
        }
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(AuditLogResponseDto::fromEntity);
    }

    private String sanitizeString(String val, int maxLen) {
        if (val == null) return null;
        String trimmed = val.trim();
        return trimmed.length() > maxLen ? trimmed.substring(0, maxLen) : trimmed;
    }

    private String sanitizeMetadata(String metadata) {
        if (metadata == null) return null;
        return metadata
                .replaceAll("(?i)(\"password\"\\s*:\\s*\")[^\"]+(\")", "$1***$2")
                .replaceAll("(?i)(\"token\"\\s*:\\s*\")[^\"]+(\")", "$1***$2")
                .replaceAll("(?i)(\"otp\"\\s*:\\s*\")[^\"]+(\")", "$1***$2")
                .replaceAll("(?i)(\"code\"\\s*:\\s*\")[^\"]+(\")", "$1***$2");
    }
}
