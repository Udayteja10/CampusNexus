package com.campusnexus.controller;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.AssignCoordinatorRequest;
import com.campusnexus.dto.UserDto;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.service.StudentCoordinatorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/student-coordinators")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentCoordinatorController {

    private final StudentCoordinatorService studentCoordinatorService;

    public AdminStudentCoordinatorController(StudentCoordinatorService studentCoordinatorService) {
        this.studentCoordinatorService = studentCoordinatorService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserDto>> assignCoordinator(@Valid @RequestBody AssignCoordinatorRequest request) {
        UserDto result = studentCoordinatorService.assignCoordinator(request.userId(), request.departmentId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student coordinator assigned successfully", result));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserDto>> removeCoordinator(@PathVariable Long userId) {
        UserDto result = studentCoordinatorService.removeCoordinator(userId);
        return ResponseEntity.ok(ApiResponse.success("Student coordinator removed successfully", result));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<UserDto>> getCoordinatorByDepartment(@PathVariable Long departmentId) {
        UserDto result = studentCoordinatorService.getCoordinatorByDepartmentId(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No active student coordinator found for department id: " + departmentId));
        return ResponseEntity.ok(ApiResponse.success("Student coordinator retrieved successfully", result));
    }
}
