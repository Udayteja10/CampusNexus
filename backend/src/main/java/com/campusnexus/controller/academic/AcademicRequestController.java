package com.campusnexus.controller.academic;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.academic.AcademicRequestDto;
import com.campusnexus.entity.academic.RequestStatus;
import com.campusnexus.service.academic.AcademicRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/academic/requests")
public class AcademicRequestController {

    private final AcademicRequestService requestService;

    public AcademicRequestController(AcademicRequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AcademicRequestDto>>> getRequests(
            Authentication authentication,
            @RequestParam(name = "departmentId", required = false) Long departmentId,
            @RequestParam(name = "status", required = false) RequestStatus status) {
        List<AcademicRequestDto> requests = requestService.getRequests(authentication, departmentId, status);
        return ResponseEntity.ok(ApiResponse.success("Academic requests retrieved successfully", requests));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademicRequestDto>> getRequestById(
            Authentication authentication,
            @PathVariable("id") Long id) {
        AcademicRequestDto request = requestService.getRequestById(authentication, id);
        return ResponseEntity.ok(ApiResponse.success("Academic request retrieved successfully", request));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AcademicRequestDto>> createRequest(
            Authentication authentication,
            @Valid @RequestBody AcademicRequestDto.CreateRequest request) {
        AcademicRequestDto created = requestService.createRequest(authentication, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Academic request submitted successfully", created));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRequest(
            Authentication authentication,
            @PathVariable("id") Long id) {
        requestService.deleteRequest(authentication, id);
        return ResponseEntity.ok(ApiResponse.success("Academic request deleted successfully", null));
    }
}
