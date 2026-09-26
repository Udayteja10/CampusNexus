package com.campusnexus.controller.campuslife;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.campuslife.CampusWikiPageRequestDto;
import com.campusnexus.dto.campuslife.CampusWikiPageResponseDto;
import com.campusnexus.dto.campuslife.WikiModerationDto;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.CampusWikiCategory;
import com.campusnexus.entity.campuslife.WikiStatus;
import com.campusnexus.security.AuthorizationService;
import com.campusnexus.service.campuslife.CampusWikiService;
import jakarta.validation.Valid;
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

import java.util.List;

@RestController("campusLifeWikiController")
@RequestMapping("/api/v1/wiki")
public class CampusWikiController {

    private final CampusWikiService wikiService;
    private final AuthorizationService authorizationService;

    public CampusWikiController(CampusWikiService wikiService,
                                AuthorizationService authorizationService) {
        this.wikiService = wikiService;
        this.authorizationService = authorizationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CampusWikiPageResponseDto>>> searchPages(
            Authentication authentication,
            @RequestParam(required = false) WikiStatus status,
            @RequestParam(required = false) CampusWikiCategory category,
            @RequestParam(required = false) String keyword
    ) {
        User user = resolveUser(authentication);
        List<CampusWikiPageResponseDto> pages = wikiService.searchPages(status, category, keyword, user);
        return ResponseEntity.ok(ApiResponse.success("Campus Wiki pages retrieved successfully", pages));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<CampusWikiPageResponseDto>>> getMyPages(
            Authentication authentication
    ) {
        User user = resolveUser(authentication);
        List<CampusWikiPageResponseDto> pages = wikiService.getMyPages(user);
        return ResponseEntity.ok(ApiResponse.success("User wiki pages retrieved successfully", pages));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CampusWikiPageResponseDto>> getPageById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        User user = resolveUser(authentication);
        CampusWikiPageResponseDto page = wikiService.getPageById(id, user);
        return ResponseEntity.ok(ApiResponse.success("Campus Wiki page retrieved successfully", page));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<CampusWikiPageResponseDto>> getPageBySlug(
            Authentication authentication,
            @PathVariable String slug
    ) {
        User user = resolveUser(authentication);
        CampusWikiPageResponseDto page = wikiService.getPageBySlug(slug, user);
        return ResponseEntity.ok(ApiResponse.success("Campus Wiki page retrieved successfully", page));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CampusWikiPageResponseDto>> createPage(
            Authentication authentication,
            @Valid @RequestBody CampusWikiPageRequestDto dto
    ) {
        User user = resolveUser(authentication);
        CampusWikiPageResponseDto created = wikiService.createPage(dto, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Campus Wiki page created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CampusWikiPageResponseDto>> updatePage(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CampusWikiPageRequestDto dto
    ) {
        User user = resolveUser(authentication);
        CampusWikiPageResponseDto updated = wikiService.updatePage(id, dto, user);
        return ResponseEntity.ok(ApiResponse.success("Campus Wiki page updated successfully", updated));
    }

    @PatchMapping("/{id}/moderate")
    public ResponseEntity<ApiResponse<CampusWikiPageResponseDto>> moderatePage(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody WikiModerationDto dto
    ) {
        User user = resolveUser(authentication);
        CampusWikiPageResponseDto updated = wikiService.moderatePage(id, dto, user);
        return ResponseEntity.ok(ApiResponse.success("Campus Wiki page moderated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePage(
            Authentication authentication,
            @PathVariable Long id
    ) {
        User user = resolveUser(authentication);
        wikiService.deletePage(id, user);
        return ResponseEntity.ok(ApiResponse.success("Campus Wiki page deleted successfully", null));
    }

    private User resolveUser(Authentication authentication) {
        return authorizationService.resolveAuthenticatedUser(authentication)
                .orElseThrow(() -> new AccessDeniedException("Unauthenticated or invalid user."));
    }
}
