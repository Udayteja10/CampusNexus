package com.campusnexus.controller.campuslife;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.campuslife.ClubAchievementRequestDto;
import com.campusnexus.dto.campuslife.ClubAchievementResponseDto;
import com.campusnexus.dto.campuslife.ClubAnnouncementRequestDto;
import com.campusnexus.dto.campuslife.ClubAnnouncementResponseDto;
import com.campusnexus.dto.campuslife.ClubEventRequestDto;
import com.campusnexus.dto.campuslife.ClubEventResponseDto;
import com.campusnexus.dto.campuslife.ClubGalleryItemRequestDto;
import com.campusnexus.dto.campuslife.ClubGalleryItemResponseDto;
import com.campusnexus.dto.campuslife.ClubRequestDto;
import com.campusnexus.dto.campuslife.ClubResponseDto;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.ClubCategory;
import com.campusnexus.security.AuthorizationService;
import com.campusnexus.service.campuslife.ClubService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clubs")
public class ClubController {

    private final ClubService clubService;
    private final AuthorizationService authorizationService;

    public ClubController(ClubService clubService,
                          AuthorizationService authorizationService) {
        this.clubService = clubService;
        this.authorizationService = authorizationService;
    }

    // ==========================================
    // Clubs
    // ==========================================

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClubResponseDto>>> getAllClubs(
            Authentication authentication,
            @RequestParam(required = false) ClubCategory category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword
    ) {
        User user = resolveOptionalUser(authentication);
        List<ClubResponseDto> clubs = clubService.getAllClubs(category, status, keyword, user);
        return ResponseEntity.ok(ApiResponse.success("Clubs retrieved successfully", clubs));
    }

    @GetMapping("/events/upcoming")
    public ResponseEntity<ApiResponse<List<ClubEventResponseDto>>> getAllUpcomingEvents() {
        List<ClubEventResponseDto> events = clubService.getAllUpcomingEvents();
        return ResponseEntity.ok(ApiResponse.success("Upcoming club events retrieved successfully", events));
    }

    @GetMapping("/my-presidencies")
    public ResponseEntity<ApiResponse<List<ClubResponseDto>>> getMyPresidencies(Authentication authentication) {
        User user = resolveUser(authentication);
        List<ClubResponseDto> presidencies = clubService.getMyPresidencies(user);
        return ResponseEntity.ok(ApiResponse.success("User presidencies retrieved successfully", presidencies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClubResponseDto>> getClubById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        User user = resolveOptionalUser(authentication);
        ClubResponseDto club = clubService.getClubById(id, user);
        return ResponseEntity.ok(ApiResponse.success("Club retrieved successfully", club));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ClubResponseDto>> getClubBySlug(
            Authentication authentication,
            @PathVariable String slug
    ) {
        User user = resolveOptionalUser(authentication);
        ClubResponseDto club = clubService.getClubBySlug(slug, user);
        return ResponseEntity.ok(ApiResponse.success("Club retrieved successfully", club));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ClubResponseDto>> createClub(
            Authentication authentication,
            @Valid @RequestBody ClubRequestDto dto
    ) {
        User user = resolveUser(authentication);
        ClubResponseDto created = clubService.createClub(dto, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Club created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ClubResponseDto>> updateClub(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ClubRequestDto dto
    ) {
        User user = resolveUser(authentication);
        ClubResponseDto updated = clubService.updateClub(id, dto, user);
        return ResponseEntity.ok(ApiResponse.success("Club updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteClub(
            Authentication authentication,
            @PathVariable Long id
    ) {
        User user = resolveUser(authentication);
        clubService.deleteClub(id, user);
        return ResponseEntity.ok(ApiResponse.success("Club deleted successfully", null));
    }

    // ==========================================
    // Announcements
    // ==========================================

    @GetMapping("/{clubId}/announcements")
    public ResponseEntity<ApiResponse<List<ClubAnnouncementResponseDto>>> getAnnouncements(@PathVariable Long clubId) {
        List<ClubAnnouncementResponseDto> list = clubService.getAnnouncements(clubId);
        return ResponseEntity.ok(ApiResponse.success("Club announcements retrieved successfully", list));
    }

    @PostMapping("/{clubId}/announcements")
    public ResponseEntity<ApiResponse<ClubAnnouncementResponseDto>> createAnnouncement(
            Authentication authentication,
            @PathVariable Long clubId,
            @Valid @RequestBody ClubAnnouncementRequestDto dto
    ) {
        User user = resolveUser(authentication);
        ClubAnnouncementResponseDto created = clubService.createAnnouncement(clubId, dto, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Club announcement created successfully", created));
    }

    @PutMapping("/{clubId}/announcements/{announcementId}")
    public ResponseEntity<ApiResponse<ClubAnnouncementResponseDto>> updateAnnouncement(
            Authentication authentication,
            @PathVariable Long clubId,
            @PathVariable Long announcementId,
            @Valid @RequestBody ClubAnnouncementRequestDto dto
    ) {
        User user = resolveUser(authentication);
        ClubAnnouncementResponseDto updated = clubService.updateAnnouncement(clubId, announcementId, dto, user);
        return ResponseEntity.ok(ApiResponse.success("Club announcement updated successfully", updated));
    }

    @DeleteMapping("/{clubId}/announcements/{announcementId}")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(
            Authentication authentication,
            @PathVariable Long clubId,
            @PathVariable Long announcementId
    ) {
        User user = resolveUser(authentication);
        clubService.deleteAnnouncement(clubId, announcementId, user);
        return ResponseEntity.ok(ApiResponse.success("Club announcement deleted successfully", null));
    }

    // ==========================================
    // Events
    // ==========================================

    @GetMapping("/{clubId}/events")
    public ResponseEntity<ApiResponse<List<ClubEventResponseDto>>> getEvents(@PathVariable Long clubId) {
        List<ClubEventResponseDto> list = clubService.getEvents(clubId);
        return ResponseEntity.ok(ApiResponse.success("Club events retrieved successfully", list));
    }

    @PostMapping("/{clubId}/events")
    public ResponseEntity<ApiResponse<ClubEventResponseDto>> createEvent(
            Authentication authentication,
            @PathVariable Long clubId,
            @Valid @RequestBody ClubEventRequestDto dto
    ) {
        User user = resolveUser(authentication);
        ClubEventResponseDto created = clubService.createEvent(clubId, dto, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Club event created successfully", created));
    }

    @PutMapping("/{clubId}/events/{eventId}")
    public ResponseEntity<ApiResponse<ClubEventResponseDto>> updateEvent(
            Authentication authentication,
            @PathVariable Long clubId,
            @PathVariable Long eventId,
            @Valid @RequestBody ClubEventRequestDto dto
    ) {
        User user = resolveUser(authentication);
        ClubEventResponseDto updated = clubService.updateEvent(clubId, eventId, dto, user);
        return ResponseEntity.ok(ApiResponse.success("Club event updated successfully", updated));
    }

    @DeleteMapping("/{clubId}/events/{eventId}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            Authentication authentication,
            @PathVariable Long clubId,
            @PathVariable Long eventId
    ) {
        User user = resolveUser(authentication);
        clubService.deleteEvent(clubId, eventId, user);
        return ResponseEntity.ok(ApiResponse.success("Club event deleted successfully", null));
    }

    // ==========================================
    // Gallery
    // ==========================================

    @GetMapping("/{clubId}/gallery")
    public ResponseEntity<ApiResponse<List<ClubGalleryItemResponseDto>>> getGallery(@PathVariable Long clubId) {
        List<ClubGalleryItemResponseDto> list = clubService.getGallery(clubId);
        return ResponseEntity.ok(ApiResponse.success("Club gallery retrieved successfully", list));
    }

    @PostMapping("/{clubId}/gallery")
    public ResponseEntity<ApiResponse<ClubGalleryItemResponseDto>> addGalleryItem(
            Authentication authentication,
            @PathVariable Long clubId,
            @Valid @RequestBody ClubGalleryItemRequestDto dto
    ) {
        User user = resolveUser(authentication);
        ClubGalleryItemResponseDto created = clubService.addGalleryItem(clubId, dto, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Club gallery item added successfully", created));
    }

    @DeleteMapping("/{clubId}/gallery/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deleteGalleryItem(
            Authentication authentication,
            @PathVariable Long clubId,
            @PathVariable Long itemId
    ) {
        User user = resolveUser(authentication);
        clubService.deleteGalleryItem(clubId, itemId, user);
        return ResponseEntity.ok(ApiResponse.success("Club gallery item deleted successfully", null));
    }

    // ==========================================
    // Achievements
    // ==========================================

    @GetMapping("/{clubId}/achievements")
    public ResponseEntity<ApiResponse<List<ClubAchievementResponseDto>>> getAchievements(@PathVariable Long clubId) {
        List<ClubAchievementResponseDto> list = clubService.getAchievements(clubId);
        return ResponseEntity.ok(ApiResponse.success("Club achievements retrieved successfully", list));
    }

    @PostMapping("/{clubId}/achievements")
    public ResponseEntity<ApiResponse<ClubAchievementResponseDto>> addAchievement(
            Authentication authentication,
            @PathVariable Long clubId,
            @Valid @RequestBody ClubAchievementRequestDto dto
    ) {
        User user = resolveUser(authentication);
        ClubAchievementResponseDto created = clubService.addAchievement(clubId, dto, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Club achievement added successfully", created));
    }

    @PutMapping("/{clubId}/achievements/{achievementId}")
    public ResponseEntity<ApiResponse<ClubAchievementResponseDto>> updateAchievement(
            Authentication authentication,
            @PathVariable Long clubId,
            @PathVariable Long achievementId,
            @Valid @RequestBody ClubAchievementRequestDto dto
    ) {
        User user = resolveUser(authentication);
        ClubAchievementResponseDto updated = clubService.updateAchievement(clubId, achievementId, dto, user);
        return ResponseEntity.ok(ApiResponse.success("Club achievement updated successfully", updated));
    }

    @DeleteMapping("/{clubId}/achievements/{achievementId}")
    public ResponseEntity<ApiResponse<Void>> deleteAchievement(
            Authentication authentication,
            @PathVariable Long clubId,
            @PathVariable Long achievementId
    ) {
        User user = resolveUser(authentication);
        clubService.deleteAchievement(clubId, achievementId, user);
        return ResponseEntity.ok(ApiResponse.success("Club achievement deleted successfully", null));
    }

    private User resolveUser(Authentication authentication) {
        return authorizationService.resolveAuthenticatedUser(authentication)
                .orElseThrow(() -> new AccessDeniedException("Unauthenticated or invalid user."));
    }

    private User resolveOptionalUser(Authentication authentication) {
        return authorizationService.resolveAuthenticatedUser(authentication).orElse(null);
    }
}
