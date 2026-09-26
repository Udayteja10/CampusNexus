package com.campusnexus.controller.academic;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.academic.StudyGroupDto;
import com.campusnexus.service.academic.StudyGroupService;
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
@RequestMapping("/api/v1/academic/study-groups")
public class StudyGroupController {

    private final StudyGroupService studyGroupService;

    public StudyGroupController(StudyGroupService studyGroupService) {
        this.studyGroupService = studyGroupService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StudyGroupDto>>> getStudyGroups(
            Authentication authentication,
            @RequestParam(name = "departmentId", required = false) Long departmentId,
            @RequestParam(name = "semester", required = false) Integer semester) {
        List<StudyGroupDto> groups = studyGroupService.getStudyGroups(authentication, departmentId, semester);
        return ResponseEntity.ok(ApiResponse.success("Study groups retrieved successfully", groups));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudyGroupDto>> getStudyGroupById(
            Authentication authentication,
            @PathVariable("id") Long id) {
        StudyGroupDto group = studyGroupService.getStudyGroupById(authentication, id);
        return ResponseEntity.ok(ApiResponse.success("Study group retrieved successfully", group));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StudyGroupDto>> createStudyGroup(
            Authentication authentication,
            @Valid @RequestBody StudyGroupDto.CreateRequest request) {
        StudyGroupDto created = studyGroupService.createStudyGroup(authentication, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Study group created successfully", created));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStudyGroup(
            Authentication authentication,
            @PathVariable("id") Long id) {
        studyGroupService.deleteStudyGroup(authentication, id);
        return ResponseEntity.ok(ApiResponse.success("Study group deleted successfully", null));
    }
}
