package com.campusnexus.service;

import com.campusnexus.dto.AuditLogResponseDto;
import com.campusnexus.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {

    void logEvent(User user, String action, String targetType, String targetId, String ipAddress, String userAgent, String metadata);

    void logEvent(Long userId, String action, String targetType, String targetId, String ipAddress, String userAgent, String metadata);

    void logEvent(String action, String targetType, String targetId, String metadata);

    Page<AuditLogResponseDto> getAuditLogs(String action, Long userId, Pageable pageable);
}
