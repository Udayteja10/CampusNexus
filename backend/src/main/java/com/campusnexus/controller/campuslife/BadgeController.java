package com.campusnexus.controller.campuslife;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.campuslife.AwardBadgeRequestDto;
import com.campusnexus.dto.campuslife.BadgeDto;
import com.campusnexus.dto.campuslife.UserBadgeResponseDto;
import com.campusnexus.entity.User;
import com.campusnexus.security.AuthorizationService;
import com.campusnexus.service.campuslife.BadgeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/badges")
public class BadgeController {

    private final BadgeService badgeService;
    private final AuthorizationService authorizationService;

    public BadgeController(BadgeService badgeService,
                           AuthorizationService authorizationService) {
        this.badgeService = badgeService;
        this.authorizationService = authorizationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BadgeDto>>> getAllBadges() {
        List<BadgeDto> badges = badgeService.getAllBadges();
        return ResponseEntity.ok(ApiResponse.success("Badges retrieved successfully", badges));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BadgeDto>> getBadgeById(@PathVariable Long id) {
        BadgeDto badge = badgeService.getBadgeById(id);
        return ResponseEntity.ok(ApiResponse.success("Badge retrieved successfully", badge));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<UserBadgeResponseDto>>> getMyBadges(
            Authentication authentication
    ) {
        User user = resolveUser(authentication);
        List<UserBadgeResponseDto> badges = badgeService.getMyBadges(user);
        return ResponseEntity.ok(ApiResponse.success("User badges retrieved successfully", badges));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<UserBadgeResponseDto>>> getUserBadges(@PathVariable Long userId) {
        List<UserBadgeResponseDto> badges = badgeService.getUserBadges(userId);
        return ResponseEntity.ok(ApiResponse.success("User badges retrieved successfully", badges));
    }

    @PostMapping("/award")
    public ResponseEntity<ApiResponse<UserBadgeResponseDto>> awardBadge(
            Authentication authentication,
            @Valid @RequestBody AwardBadgeRequestDto dto
    ) {
        User user = resolveUser(authentication);
        UserBadgeResponseDto awarded = badgeService.awardBadge(dto.getUserId(), dto.getBadgeId(), user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Achievement badge awarded successfully", awarded));
    }

    private User resolveUser(Authentication authentication) {
        return authorizationService.resolveAuthenticatedUser(authentication)
                .orElseThrow(() -> new AccessDeniedException("Unauthenticated or invalid user."));
    }
}
