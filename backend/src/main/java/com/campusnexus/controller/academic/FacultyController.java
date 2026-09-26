package com.campusnexus.controller.academic;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.academic.FacultyDto;
import com.campusnexus.dto.academic.FacultyReviewDto;
import com.campusnexus.service.academic.FacultyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/academic/faculty")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FacultyDto>>> getFacultyList(
            Authentication authentication,
            @RequestParam(name = "departmentId", required = false) Long departmentId) {
        List<FacultyDto> list = facultyService.getFacultyList(authentication, departmentId);
        return ResponseEntity.ok(ApiResponse.success("Faculty members retrieved successfully", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultyDto>> getFacultyById(
            Authentication authentication,
            @PathVariable("id") Long id) {
        FacultyDto faculty = facultyService.getFacultyById(authentication, id);
        return ResponseEntity.ok(ApiResponse.success("Faculty member retrieved successfully", faculty));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FacultyDto>> createFaculty(
            Authentication authentication,
            @Valid @RequestBody FacultyDto.CreateRequest request) {
        FacultyDto created = facultyService.createFaculty(authentication, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Faculty member created successfully", created));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<List<FacultyReviewDto>>> getFacultyReviews(
            Authentication authentication,
            @PathVariable("id") Long facultyId) {
        List<FacultyReviewDto> reviews = facultyService.getReviewsForFaculty(authentication, facultyId);
        return ResponseEntity.ok(ApiResponse.success("Faculty reviews retrieved successfully", reviews));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<FacultyReviewDto>> createFacultyReview(
            Authentication authentication,
            @PathVariable("id") Long facultyId,
            @Valid @RequestBody FacultyReviewDto.CreateRequest request) {
        request.setFacultyId(facultyId);
        FacultyReviewDto review = facultyService.createReview(authentication, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Faculty review submitted successfully", review));
    }
}
