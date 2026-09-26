package com.campusnexus.controller.campuslife;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.campuslife.LostFoundReportRequestDto;
import com.campusnexus.dto.campuslife.LostFoundReportResponseDto;
import com.campusnexus.dto.campuslife.LostFoundStatusUpdateDto;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.LostFoundCategory;
import com.campusnexus.entity.campuslife.LostFoundType;
import com.campusnexus.entity.campuslife.ReportStatus;
import com.campusnexus.security.AuthorizationService;
import com.campusnexus.service.campuslife.LostFoundService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/lost-found")
public class LostFoundController {

    private final LostFoundService lostFoundService;
    private final AuthorizationService authorizationService;

    public LostFoundController(LostFoundService lostFoundService,
                               AuthorizationService authorizationService) {
        this.lostFoundService = lostFoundService;
        this.authorizationService = authorizationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LostFoundReportResponseDto>>> searchReports(
            @RequestParam(required = false) LostFoundType type,
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) LostFoundCategory category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String keyword
    ) {
        List<LostFoundReportResponseDto> reports = lostFoundService.searchReports(
                type, status, category, location, fromDate, toDate, keyword
        );
        return ResponseEntity.ok(ApiResponse.success("Lost & Found reports retrieved successfully", reports));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<LostFoundReportResponseDto>>> getMyReports(
            Authentication authentication
    ) {
        User user = resolveUser(authentication);
        List<LostFoundReportResponseDto> reports = lostFoundService.getMyReports(user);
        return ResponseEntity.ok(ApiResponse.success("User Lost & Found reports retrieved successfully", reports));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LostFoundReportResponseDto>> getReportById(@PathVariable Long id) {
        LostFoundReportResponseDto report = lostFoundService.getReportById(id);
        return ResponseEntity.ok(ApiResponse.success("Lost & Found report retrieved successfully", report));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LostFoundReportResponseDto>> createReport(
            Authentication authentication,
            @Valid @RequestBody LostFoundReportRequestDto dto
    ) {
        User user = resolveUser(authentication);
        LostFoundReportResponseDto created = lostFoundService.createReport(dto, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Lost & Found report submitted successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LostFoundReportResponseDto>> updateReport(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody LostFoundReportRequestDto dto
    ) {
        User user = resolveUser(authentication);
        LostFoundReportResponseDto updated = lostFoundService.updateReport(id, dto, user);
        return ResponseEntity.ok(ApiResponse.success("Lost & Found report updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<LostFoundReportResponseDto>> updateStatus(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody LostFoundStatusUpdateDto dto
    ) {
        User user = resolveUser(authentication);
        LostFoundReportResponseDto updated = lostFoundService.updateStatus(id, dto.getStatus(), user);
        return ResponseEntity.ok(ApiResponse.success("Lost & Found report status updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(
            Authentication authentication,
            @PathVariable Long id
    ) {
        User user = resolveUser(authentication);
        lostFoundService.deleteReport(id, user);
        return ResponseEntity.ok(ApiResponse.success("Lost & Found report deleted successfully", null));
    }

    private User resolveUser(Authentication authentication) {
        return authorizationService.resolveAuthenticatedUser(authentication)
                .orElseThrow(() -> new AccessDeniedException("Unauthenticated or invalid user."));
    }
}
