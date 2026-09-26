package com.campusnexus.service.campuslife;

import com.campusnexus.dto.campuslife.AssignClubPresidentRequestDto;
import com.campusnexus.dto.campuslife.ClubPresidentDto;
import com.campusnexus.dto.campuslife.ClubRequestDto;
import com.campusnexus.dto.campuslife.ClubResponseDto;
import com.campusnexus.dto.campuslife.PresidentCandidateDto;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.Club;
import com.campusnexus.entity.campuslife.ClubCategory;
import com.campusnexus.entity.campuslife.ClubPresident;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.UserRepository;
import com.campusnexus.repository.campuslife.ClubAchievementRepository;
import com.campusnexus.repository.campuslife.ClubAnnouncementRepository;
import com.campusnexus.repository.campuslife.ClubEventRepository;
import com.campusnexus.repository.campuslife.ClubGalleryItemRepository;
import com.campusnexus.repository.campuslife.ClubPresidentRepository;
import com.campusnexus.repository.campuslife.ClubRepository;
import com.campusnexus.service.AuditLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminClubServiceImpl implements AdminClubService {

    private final ClubRepository clubRepository;
    private final ClubPresidentRepository clubPresidentRepository;
    private final ClubAnnouncementRepository announcementRepository;
    private final ClubEventRepository eventRepository;
    private final ClubGalleryItemRepository galleryItemRepository;
    private final ClubAchievementRepository achievementRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final ClubAuthorizationService authorizationService;

    public AdminClubServiceImpl(ClubRepository clubRepository,
                                ClubPresidentRepository clubPresidentRepository,
                                ClubAnnouncementRepository announcementRepository,
                                ClubEventRepository eventRepository,
                                ClubGalleryItemRepository galleryItemRepository,
                                ClubAchievementRepository achievementRepository,
                                UserRepository userRepository,
                                AuditLogService auditLogService,
                                ClubAuthorizationService authorizationService) {
        this.clubRepository = clubRepository;
        this.clubPresidentRepository = clubPresidentRepository;
        this.announcementRepository = announcementRepository;
        this.eventRepository = eventRepository;
        this.galleryItemRepository = galleryItemRepository;
        this.achievementRepository = achievementRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.authorizationService = authorizationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClubResponseDto> getAllClubsForAdmin(ClubCategory category, String status, String keyword) {
        List<Club> clubs = clubRepository.searchClubs(category, status, keyword);
        List<ClubPresident> activePresidents = clubPresidentRepository.findAllActive();
        Map<Long, ClubPresidentDto> presidentMap = activePresidents.stream()
                .collect(Collectors.toMap(
                        cp -> cp.getClub().getId(),
                        ClubPresidentDto::fromEntity,
                        (existing, replacement) -> existing
                ));

        return clubs.stream()
                .map(c -> ClubResponseDto.fromEntity(c, presidentMap.get(c.getId()), true))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ClubResponseDto getClubByIdForAdmin(Long id) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with ID: " + id));

        ClubPresidentDto presidentDto = clubPresidentRepository.findByClubIdAndActiveTrue(id)
                .map(ClubPresidentDto::fromEntity)
                .orElse(null);

        return ClubResponseDto.fromEntity(club, presidentDto, true);
    }

    @Override
    @Transactional
    public ClubResponseDto createClub(ClubRequestDto dto, User adminUser) {
        authorizationService.requireAdmin(adminUser);

        if (clubRepository.existsBySlug(dto.getSlug())) {
            throw new IllegalArgumentException("A club with this slug already exists: " + dto.getSlug());
        }

        Club club = new Club(
                dto.getName(),
                dto.getSlug().toLowerCase().trim(),
                dto.getDescription(),
                dto.getCategory(),
                dto.getLogoUrl(),
                dto.getCoverUrl(),
                dto.getContactEmail(),
                dto.getSocialLinks()
        );
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            club.setStatus(dto.getStatus().toUpperCase().trim());
        }

        Club saved = clubRepository.save(club);

        auditLogService.logEvent(
                adminUser,
                "CLUB_CREATED",
                "CLUB",
                String.valueOf(saved.getId()),
                null,
                null,
                "Created club: " + saved.getName() + " (" + saved.getCategory() + ")"
        );

        return ClubResponseDto.fromEntity(saved, null, true);
    }

    @Override
    @Transactional
    public ClubResponseDto updateClub(Long id, ClubRequestDto dto, User adminUser) {
        authorizationService.requireAdmin(adminUser);

        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with ID: " + id));

        String newSlug = dto.getSlug().toLowerCase().trim();
        if (!club.getSlug().equalsIgnoreCase(newSlug) && clubRepository.existsBySlug(newSlug)) {
            throw new IllegalArgumentException("A club with this slug already exists: " + newSlug);
        }

        club.setName(dto.getName());
        club.setSlug(newSlug);
        club.setDescription(dto.getDescription());
        club.setCategory(dto.getCategory());
        club.setLogoUrl(dto.getLogoUrl());
        club.setCoverUrl(dto.getCoverUrl());
        club.setContactEmail(dto.getContactEmail());
        club.setSocialLinks(dto.getSocialLinks());
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            club.setStatus(dto.getStatus().toUpperCase().trim());
        }

        Club updated = clubRepository.save(club);

        auditLogService.logEvent(
                adminUser,
                "CLUB_UPDATED",
                "CLUB",
                String.valueOf(updated.getId()),
                null,
                null,
                "Updated club: " + updated.getName()
        );

        ClubPresidentDto presidentDto = clubPresidentRepository.findByClubIdAndActiveTrue(id)
                .map(ClubPresidentDto::fromEntity)
                .orElse(null);

        return ClubResponseDto.fromEntity(updated, presidentDto, true);
    }

    @Override
    @Transactional
    public ClubResponseDto updateClubStatus(Long id, String status, User adminUser) {
        authorizationService.requireAdmin(adminUser);

        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with ID: " + id));

        String normalizedStatus = status != null ? status.toUpperCase().trim() : "ACTIVE";
        if (!"ACTIVE".equals(normalizedStatus) && !"INACTIVE".equals(normalizedStatus)) {
            throw new IllegalArgumentException("Invalid club status: " + status + ". Allowed: ACTIVE, INACTIVE");
        }

        club.setStatus(normalizedStatus);
        Club updated = clubRepository.save(club);

        auditLogService.logEvent(
                adminUser,
                "ACTIVE".equals(normalizedStatus) ? "CLUB_RESTORED" : "CLUB_DEACTIVATED",
                "CLUB",
                String.valueOf(updated.getId()),
                null,
                null,
                "Changed status of " + updated.getName() + " to " + normalizedStatus
        );

        ClubPresidentDto presidentDto = clubPresidentRepository.findByClubIdAndActiveTrue(id)
                .map(ClubPresidentDto::fromEntity)
                .orElse(null);

        return ClubResponseDto.fromEntity(updated, presidentDto, true);
    }

    @Override
    @Transactional
    public void deleteClub(Long id, User adminUser) {
        authorizationService.requireAdmin(adminUser);

        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with ID: " + id));

        announcementRepository.findByClubIdOrderByPublishedAtDesc(id).forEach(announcementRepository::delete);
        eventRepository.findByClubIdOrderByStartDateTimeAsc(id).forEach(eventRepository::delete);
        galleryItemRepository.findByClubIdOrderByCreatedAtDesc(id).forEach(galleryItemRepository::delete);
        achievementRepository.findByClubIdOrderByAchievementDateDesc(id).forEach(achievementRepository::delete);
        clubPresidentRepository.findByClubIdOrderByAssignedAtDesc(id).forEach(clubPresidentRepository::delete);
        clubRepository.delete(club);

        auditLogService.logEvent(
                adminUser,
                "CLUB_DELETED",
                "CLUB",
                String.valueOf(id),
                null,
                null,
                "Deleted club: " + club.getName()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ClubPresidentDto getClubPresident(Long clubId) {
        if (!clubRepository.existsById(clubId)) {
            throw new ResourceNotFoundException("Club not found with ID: " + clubId);
        }

        return clubPresidentRepository.findByClubIdAndActiveTrue(clubId)
                .map(ClubPresidentDto::fromEntity)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClubPresidentDto> getClubPresidentHistory(Long clubId) {
        if (!clubRepository.existsById(clubId)) {
            throw new ResourceNotFoundException("Club not found with ID: " + clubId);
        }

        return clubPresidentRepository.findByClubIdOrderByAssignedAtDesc(clubId)
                .stream()
                .map(ClubPresidentDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClubPresidentDto assignClubPresident(Long clubId, AssignClubPresidentRequestDto dto, User adminUser) {
        authorizationService.requireAdmin(adminUser);

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with ID: " + clubId));

        User targetUser = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + dto.getUserId()));

        if (targetUser.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("Only students can be assigned as club presidents.");
        }

        if (!targetUser.isEnabled()) {
            throw new IllegalArgumentException("Disabled students cannot be assigned as club presidents.");
        }

        if (!targetUser.isEmailVerified()) {
            throw new IllegalArgumentException("This student has not verified their institutional email.");
        }

        // Enforce: student can be president of ONLY ONE club at a time
        List<ClubPresident> activePresidencies = clubPresidentRepository.findByUserIdAndActiveTrue(targetUser.getId());
        for (ClubPresident cp : activePresidencies) {
            if (!cp.getClub().getId().equals(clubId)) {
                throw new IllegalArgumentException("This student is already president of another club. Remove the existing presidency before assigning a new club.");
            }
        }

        // Check if there is already an active president on THIS club
        var existingActiveOpt = clubPresidentRepository.findByClubIdAndActiveTrue(clubId);
        if (existingActiveOpt.isPresent()) {
            ClubPresident existing = existingActiveOpt.get();
            if (existing.getUser().getId().equals(targetUser.getId())) {
                // Same user is already president
                return ClubPresidentDto.fromEntity(existing);
            }
            // Deactivate previous president
            existing.setActive(false);
            existing.setRemovedAt(LocalDateTime.now());
            existing.setRemovedBy(adminUser);
            clubPresidentRepository.save(existing);

            auditLogService.logEvent(
                    adminUser,
                    "CLUB_PRESIDENT_REPLACED",
                    "CLUB",
                    String.valueOf(clubId),
                    null,
                    null,
                    "Replaced president " + existing.getUser().getUsername() + " with " + targetUser.getUsername() + " for " + club.getName()
            );
        }

        ClubPresident newPresident = new ClubPresident(
                club,
                targetUser,
                dto.getDesignation() != null ? dto.getDesignation() : "PRESIDENT",
                adminUser
        );

        ClubPresident saved = clubPresidentRepository.save(newPresident);

        auditLogService.logEvent(
                adminUser,
                "CLUB_PRESIDENT_ASSIGNED",
                "CLUB",
                String.valueOf(clubId),
                null,
                null,
                "Assigned " + targetUser.getUsername() + " as President of " + club.getName()
        );

        return ClubPresidentDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public void removeClubPresident(Long clubId, User adminUser) {
        authorizationService.requireAdmin(adminUser);

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with ID: " + clubId));

        var existingActiveOpt = clubPresidentRepository.findByClubIdAndActiveTrue(clubId);
        if (existingActiveOpt.isPresent()) {
            ClubPresident existing = existingActiveOpt.get();
            existing.setActive(false);
            existing.setRemovedAt(LocalDateTime.now());
            existing.setRemovedBy(adminUser);
            clubPresidentRepository.save(existing);

            auditLogService.logEvent(
                    adminUser,
                    "CLUB_PRESIDENT_REMOVED",
                    "CLUB",
                    String.valueOf(clubId),
                    null,
                    null,
                    "Removed president " + existing.getUser().getUsername() + " from " + club.getName()
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PresidentCandidateDto> getPresidentCandidates(String search) {
        String query = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        List<User> candidates = userRepository.findEligiblePresidentCandidates(query);
        return candidates.stream()
                .map(PresidentCandidateDto::fromUser)
                .collect(Collectors.toList());
    }
}
