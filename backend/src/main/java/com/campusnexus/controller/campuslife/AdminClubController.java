package com.campusnexus.controller.campuslife;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.campuslife.AssignClubPresidentRequestDto;
import com.campusnexus.dto.campuslife.ClubPresidentDto;
import com.campusnexus.dto.campuslife.ClubRequestDto;
import com.campusnexus.dto.campuslife.ClubResponseDto;
import com.campusnexus.dto.campuslife.UpdateClubStatusRequestDto;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.ClubCategory;
import com.campusnexus.security.AuthorizationService;
import com.campusnexus.service.campuslife.AdminClubService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/clubs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminClubController {

    private final AdminClubService adminClubService;
    private final AuthorizationService authorizationService;

    public AdminClubController(AdminClubService adminClubService,
                               AuthorizationService authorizationService) {
        this.adminClubService = adminClubService;
        this.authorizationService = authorizationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClubResponseDto>>> getAllClubs(
            @RequestParam(required = false) ClubCategory category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword
    ) {
        List<ClubResponseDto> clubs = adminClubService.getAllClubsForAdmin(category, status, keyword);
        return ResponseEntity.ok(ApiResponse.success("Clubs retrieved successfully", clubs));
    }

    @GetMapping("/president-candidates")
    public ResponseEntity<ApiResponse<List<com.campusnexus.dto.campuslife.PresidentCandidateDto>>> getPresidentCandidates(
            @RequestParam(required = false) String search
    ) {
        List<com.campusnexus.dto.campuslife.PresidentCandidateDto> candidates = adminClubService.getPresidentCandidates(search);
        return ResponseEntity.ok(ApiResponse.success("President candidates retrieved successfully", candidates));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<ClubResponseDto>> getClubById(@PathVariable Long id) {
        ClubResponseDto club = adminClubService.getClubByIdForAdmin(id);
        return ResponseEntity.ok(ApiResponse.success("Club retrieved successfully", club));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ClubResponseDto>> createClub(
            Authentication authentication,
            @Valid @RequestBody ClubRequestDto dto
    ) {
        User adminUser = resolveUser(authentication);
        ClubResponseDto created = adminClubService.createClub(dto, adminUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Club created successfully", created));
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<ClubResponseDto>> updateClub(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ClubRequestDto dto
    ) {
        User adminUser = resolveUser(authentication);
        ClubResponseDto updated = adminClubService.updateClub(id, dto, adminUser);
        return ResponseEntity.ok(ApiResponse.success("Club updated successfully", updated));
    }

    @PatchMapping("/{id:\\d+}/status")
    public ResponseEntity<ApiResponse<ClubResponseDto>> updateClubStatus(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateClubStatusRequestDto dto
    ) {
        User adminUser = resolveUser(authentication);
        ClubResponseDto updated = adminClubService.updateClubStatus(id, dto.getStatus(), adminUser);
        return ResponseEntity.ok(ApiResponse.success("Club status updated successfully", updated));
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<Void>> deleteClub(
            Authentication authentication,
            @PathVariable Long id
    ) {
        User adminUser = resolveUser(authentication);
        adminClubService.deleteClub(id, adminUser);
        return ResponseEntity.ok(ApiResponse.success("Club deleted successfully", null));
    }

    @GetMapping({ "/{id:\\d+}/president", "/{id:\\d+}/presidents" })
    public ResponseEntity<ApiResponse<ClubPresidentDto>> getClubPresident(@PathVariable Long id) {
        ClubPresidentDto president = adminClubService.getClubPresident(id);
        return ResponseEntity.ok(ApiResponse.success("Club president retrieved successfully", president));
    }

    @GetMapping({ "/{id:\\d+}/president/history", "/{id:\\d+}/presidents/history" })
    public ResponseEntity<ApiResponse<List<ClubPresidentDto>>> getClubPresidentHistory(@PathVariable Long id) {
        List<ClubPresidentDto> history = adminClubService.getClubPresidentHistory(id);
        return ResponseEntity.ok(ApiResponse.success("Club president history retrieved successfully", history));
    }

    @PostMapping({ "/{id:\\d+}/president", "/{id:\\d+}/presidents" })
    public ResponseEntity<ApiResponse<ClubPresidentDto>> assignClubPresident(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AssignClubPresidentRequestDto dto
    ) {
        User adminUser = resolveUser(authentication);
        ClubPresidentDto assigned = adminClubService.assignClubPresident(id, dto, adminUser);
        return ResponseEntity.ok(ApiResponse.success("Club president assigned successfully", assigned));
    }

    @PutMapping({ "/{id:\\d+}/president", "/{id:\\d+}/presidents" })
    public ResponseEntity<ApiResponse<ClubPresidentDto>> replaceClubPresident(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AssignClubPresidentRequestDto dto
    ) {
        User adminUser = resolveUser(authentication);
        ClubPresidentDto assigned = adminClubService.assignClubPresident(id, dto, adminUser);
        return ResponseEntity.ok(ApiResponse.success("Club president assigned successfully", assigned));
    }

    @DeleteMapping({ "/{id:\\d+}/president", "/{id:\\d+}/presidents", "/{id:\\d+}/presidents/{userId:\\d+}" })
    public ResponseEntity<ApiResponse<Void>> removeClubPresident(
            Authentication authentication,
            @PathVariable Long id,
            @PathVariable(required = false) Long userId
    ) {
        User adminUser = resolveUser(authentication);
        adminClubService.removeClubPresident(id, adminUser);
        return ResponseEntity.ok(ApiResponse.success("Club president removed successfully", null));
    }

    private User resolveUser(Authentication authentication) {
        return authorizationService.resolveAuthenticatedUser(authentication)
                .orElseThrow(() -> new AccessDeniedException("Unauthenticated or invalid user."));
    }
}
