package com.campusnexus.controller;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.service.EmailService;
import com.campusnexus.service.EmailService.SmtpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/smtp-status")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSmtpController {

    private final EmailService emailService;

    public AdminSmtpController(EmailService emailService) {
        this.emailService = emailService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<SmtpStatus>> getSmtpStatus() {
        SmtpStatus status = emailService.getSmtpStatus();
        return ResponseEntity.ok(ApiResponse.success("SMTP status retrieved successfully", status));
    }
}
