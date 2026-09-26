package com.campusnexus.controller.academic;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.academic.SubjectDto;
import com.campusnexus.service.academic.SubjectService;
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
@RequestMapping("/api/v1/academic/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubjectDto>>> getSubjects(
            Authentication authentication,
            @RequestParam(name = "departmentId", required = false) Long departmentId,
            @RequestParam(name = "semester", required = false) Integer semester) {
        List<SubjectDto> subjects = subjectService.getSubjects(authentication, departmentId, semester);
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved successfully", subjects));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectDto>> getSubjectById(
            Authentication authentication,
            @PathVariable("id") Long id) {
        SubjectDto subject = subjectService.getSubjectById(authentication, id);
        return ResponseEntity.ok(ApiResponse.success("Subject retrieved successfully", subject));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SubjectDto>> createSubject(
            Authentication authentication,
            @Valid @RequestBody SubjectDto.CreateRequest request) {
        SubjectDto created = subjectService.createSubject(authentication, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subject created successfully", created));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(
            Authentication authentication,
            @PathVariable("id") Long id) {
        subjectService.deleteSubject(authentication, id);
        return ResponseEntity.ok(ApiResponse.success("Subject deleted successfully", null));
    }
}
