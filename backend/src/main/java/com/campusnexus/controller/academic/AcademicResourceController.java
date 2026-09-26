package com.campusnexus.controller.academic;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.academic.AcademicResourceDto;
import com.campusnexus.entity.academic.ResourceType;
import com.campusnexus.service.academic.AcademicResourceService;
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
@RequestMapping("/api/v1/academic/resources")
public class AcademicResourceController {

    private final AcademicResourceService resourceService;

    public AcademicResourceController(AcademicResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AcademicResourceDto>>> getResources(
            Authentication authentication,
            @RequestParam(name = "departmentId", required = false) Long departmentId,
            @RequestParam(name = "semester", required = false) Integer semester,
            @RequestParam(name = "resourceType", required = false) ResourceType resourceType) {
        List<AcademicResourceDto> resources = resourceService.getResources(authentication, departmentId, semester, resourceType);
        return ResponseEntity.ok(ApiResponse.success("Academic resources retrieved successfully", resources));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademicResourceDto>> getResourceById(
            Authentication authentication,
            @PathVariable("id") Long id) {
        AcademicResourceDto resource = resourceService.getResourceById(authentication, id);
        return ResponseEntity.ok(ApiResponse.success("Academic resource retrieved successfully", resource));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AcademicResourceDto>> createResource(
            Authentication authentication,
            @Valid @RequestBody AcademicResourceDto.CreateRequest request) {
        AcademicResourceDto created = resourceService.createResource(authentication, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Academic resource uploaded successfully", created));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResource(
            Authentication authentication,
            @PathVariable("id") Long id) {
        resourceService.deleteResource(authentication, id);
        return ResponseEntity.ok(ApiResponse.success("Academic resource deleted successfully", null));
    }
}
