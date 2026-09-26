package com.campusnexus.service.campuslife;

import com.campusnexus.dto.campuslife.ClubAchievementRequestDto;
import com.campusnexus.dto.campuslife.ClubAchievementResponseDto;
import com.campusnexus.dto.campuslife.ClubAnnouncementRequestDto;
import com.campusnexus.dto.campuslife.ClubAnnouncementResponseDto;
import com.campusnexus.dto.campuslife.ClubEventRequestDto;
import com.campusnexus.dto.campuslife.ClubEventResponseDto;
import com.campusnexus.dto.campuslife.ClubGalleryItemRequestDto;
import com.campusnexus.dto.campuslife.ClubGalleryItemResponseDto;
import com.campusnexus.dto.campuslife.ClubPresidentDto;
import com.campusnexus.dto.campuslife.ClubRequestDto;
import com.campusnexus.dto.campuslife.ClubResponseDto;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.Club;
import com.campusnexus.entity.campuslife.ClubAchievement;
import com.campusnexus.entity.campuslife.ClubAnnouncement;
import com.campusnexus.entity.campuslife.ClubCategory;
import com.campusnexus.entity.campuslife.ClubEvent;
import com.campusnexus.entity.campuslife.ClubGalleryItem;
import com.campusnexus.entity.campuslife.ClubPresident;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.campuslife.ClubAchievementRepository;
import com.campusnexus.repository.campuslife.ClubAnnouncementRepository;
import com.campusnexus.repository.campuslife.ClubEventRepository;
import com.campusnexus.repository.campuslife.ClubGalleryItemRepository;
import com.campusnexus.repository.campuslife.ClubPresidentRepository;
import com.campusnexus.repository.campuslife.ClubRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ClubService {

    private final ClubRepository clubRepository;
    private final ClubPresidentRepository clubPresidentRepository;
    private final ClubAnnouncementRepository announcementRepository;
    private final ClubEventRepository eventRepository;
    private final ClubGalleryItemRepository galleryItemRepository;
    private final ClubAchievementRepository achievementRepository;
    private final ClubAuthorizationService clubAuthorizationService;

    public ClubService(ClubRepository clubRepository,
                       ClubPresidentRepository clubPresidentRepository,
                       ClubAnnouncementRepository announcementRepository,
                       ClubEventRepository eventRepository,
                       ClubGalleryItemRepository galleryItemRepository,
                       ClubAchievementRepository achievementRepository,
                       ClubAuthorizationService clubAuthorizationService) {
        this.clubRepository = clubRepository;
        this.clubPresidentRepository = clubPresidentRepository;
        this.announcementRepository = announcementRepository;
        this.eventRepository = eventRepository;
        this.galleryItemRepository = galleryItemRepository;
        this.achievementRepository = achievementRepository;
        this.clubAuthorizationService = clubAuthorizationService;
    }

    // =========================================================================
    // Club Management (Public & Student-facing)
    // =========================================================================

    @Transactional(readOnly = true)
    public List<ClubResponseDto> getAllClubs(ClubCategory category, String status, String keyword, User currentUser) {
        String effectiveStatus = (status != null && !status.isBlank()) ? status : "ACTIVE";
        List<Club> clubs = clubRepository.searchClubs(category, effectiveStatus, keyword);

        List<ClubPresident> activePresidents = clubPresidentRepository.findAllActive();
        Map<Long, ClubPresidentDto> presidentMap = activePresidents.stream()
                .collect(Collectors.toMap(
                        cp -> cp.getClub().getId(),
                        ClubPresidentDto::fromEntity,
                        (existing, replacement) -> existing
                ));

        return clubs.stream()
                .map(c -> {
                    ClubPresidentDto pres = presidentMap.get(c.getId());
                    boolean canManage = clubAuthorizationService.canManageClub(currentUser, c.getId());
                    return ClubResponseDto.fromEntity(c, pres, canManage);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClubResponseDto getClubById(Long id, User currentUser) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with ID: " + id));

        ClubPresidentDto presidentDto = clubPresidentRepository.findByClubIdAndActiveTrue(id)
                .map(ClubPresidentDto::fromEntity)
                .orElse(null);

        boolean canManage = clubAuthorizationService.canManageClub(currentUser, id);
        return ClubResponseDto.fromEntity(club, presidentDto, canManage);
    }

    @Transactional(readOnly = true)
    public ClubResponseDto getClubBySlug(String slug, User currentUser) {
        Club club = clubRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with slug: " + slug));

        ClubPresidentDto presidentDto = clubPresidentRepository.findByClubIdAndActiveTrue(club.getId())
                .map(ClubPresidentDto::fromEntity)
                .orElse(null);

        boolean canManage = clubAuthorizationService.canManageClub(currentUser, club.getId());
        return ClubResponseDto.fromEntity(club, presidentDto, canManage);
    }

    @Transactional(readOnly = true)
    public List<ClubResponseDto> getMyPresidencies(User currentUser) {
        if (currentUser == null) return List.of();

        List<ClubPresident> presidencies = clubPresidentRepository.findByUserIdAndActiveTrue(currentUser.getId());
        return presidencies.stream()
                .map(cp -> ClubResponseDto.fromEntity(cp.getClub(), ClubPresidentDto.fromEntity(cp), true))
                .collect(Collectors.toList());
    }

    @Transactional
    public ClubResponseDto createClub(ClubRequestDto dto, User currentUser) {
        clubAuthorizationService.requireAdmin(currentUser);

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
        return ClubResponseDto.fromEntity(saved, null, true);
    }

    @Transactional
    public ClubResponseDto updateClub(Long id, ClubRequestDto dto, User currentUser) {
        clubAuthorizationService.requireAdmin(currentUser);

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
        if (dto.getStatus() != null) {
            club.setStatus(dto.getStatus());
        }

        Club updated = clubRepository.save(club);
        ClubPresidentDto pres = clubPresidentRepository.findByClubIdAndActiveTrue(id)
                .map(ClubPresidentDto::fromEntity)
                .orElse(null);

        return ClubResponseDto.fromEntity(updated, pres, true);
    }

    @Transactional
    public void deleteClub(Long id, User currentUser) {
        clubAuthorizationService.requireAdmin(currentUser);

        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with ID: " + id));

        club.setStatus("INACTIVE");
        clubRepository.save(club);
    }

    // =========================================================================
    // Club Announcements
    // =========================================================================

    @Transactional(readOnly = true)
    public List<ClubAnnouncementResponseDto> getAnnouncements(Long clubId) {
        if (!clubRepository.existsById(clubId)) {
            throw new ResourceNotFoundException("Club not found with ID: " + clubId);
        }
        return announcementRepository.findByClubIdOrderByPublishedAtDesc(clubId)
                .stream()
                .map(ClubAnnouncementResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClubAnnouncementResponseDto createAnnouncement(Long clubId, ClubAnnouncementRequestDto dto, User currentUser) {
        clubAuthorizationService.requireClubManager(currentUser, clubId);

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with ID: " + clubId));

        ClubAnnouncement announcement = new ClubAnnouncement(
                club,
                dto.getTitle(),
                dto.getContent(),
                LocalDateTime.now(),
                currentUser
        );

        ClubAnnouncement saved = announcementRepository.save(announcement);
        return ClubAnnouncementResponseDto.fromEntity(saved);
    }

    @Transactional
    public ClubAnnouncementResponseDto updateAnnouncement(Long clubId, Long announcementId, ClubAnnouncementRequestDto dto, User currentUser) {
        clubAuthorizationService.requireClubManager(currentUser, clubId);

        ClubAnnouncement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with ID: " + announcementId));

        if (!announcement.getClub().getId().equals(clubId)) {
            throw new IllegalArgumentException("Announcement does not belong to the specified club.");
        }

        announcement.setTitle(dto.getTitle());
        announcement.setContent(dto.getContent());
        ClubAnnouncement updated = announcementRepository.save(announcement);
        return ClubAnnouncementResponseDto.fromEntity(updated);
    }

    @Transactional
    public void deleteAnnouncement(Long clubId, Long announcementId, User currentUser) {
        clubAuthorizationService.requireClubManager(currentUser, clubId);

        ClubAnnouncement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with ID: " + announcementId));

        if (!announcement.getClub().getId().equals(clubId)) {
            throw new IllegalArgumentException("Announcement does not belong to the specified club.");
        }

        announcementRepository.delete(announcement);
    }

    // =========================================================================
    // Club Events
    // =========================================================================

    @Transactional(readOnly = true)
    public List<ClubEventResponseDto> getEvents(Long clubId) {
        if (!clubRepository.existsById(clubId)) {
            throw new ResourceNotFoundException("Club not found with ID: " + clubId);
        }
        return eventRepository.findByClubIdOrderByStartDateTimeAsc(clubId)
                .stream()
                .map(ClubEventResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClubEventResponseDto> getAllUpcomingEvents() {
        return eventRepository.findAllUpcomingEvents()
                .stream()
                .map(ClubEventResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClubEventResponseDto createEvent(Long clubId, ClubEventRequestDto dto, User currentUser) {
        clubAuthorizationService.requireClubManager(currentUser, clubId);

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with ID: " + clubId));

        if (dto.getEndDateTime().isBefore(dto.getStartDateTime())) {
            throw new IllegalArgumentException("End date time cannot be before start date time.");
        }

        ClubEvent event = new ClubEvent(
                club,
                dto.getTitle(),
                dto.getDescription(),
                dto.getVenue(),
                dto.getStartDateTime(),
                dto.getEndDateTime(),
                dto.getRegistrationLink(),
                dto.getImageUrl()
        );

        ClubEvent saved = eventRepository.save(event);
        return ClubEventResponseDto.fromEntity(saved);
    }

    @Transactional
    public ClubEventResponseDto updateEvent(Long clubId, Long eventId, ClubEventRequestDto dto, User currentUser) {
        clubAuthorizationService.requireClubManager(currentUser, clubId);

        ClubEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Club event not found with ID: " + eventId));

        if (!event.getClub().getId().equals(clubId)) {
            throw new IllegalArgumentException("Event does not belong to the specified club.");
        }

        if (dto.getEndDateTime().isBefore(dto.getStartDateTime())) {
            throw new IllegalArgumentException("End date time cannot be before start date time.");
        }

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setVenue(dto.getVenue());
        event.setStartDateTime(dto.getStartDateTime());
        event.setEndDateTime(dto.getEndDateTime());
        event.setRegistrationLink(dto.getRegistrationLink());
        event.setImageUrl(dto.getImageUrl());

        ClubEvent updated = eventRepository.save(event);
        return ClubEventResponseDto.fromEntity(updated);
    }

    @Transactional
    public void deleteEvent(Long clubId, Long eventId, User currentUser) {
        clubAuthorizationService.requireClubManager(currentUser, clubId);

        ClubEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Club event not found with ID: " + eventId));

        if (!event.getClub().getId().equals(clubId)) {
            throw new IllegalArgumentException("Event does not belong to the specified club.");
        }

        eventRepository.delete(event);
    }

    // =========================================================================
    // Club Gallery
    // =========================================================================

    @Transactional(readOnly = true)
    public List<ClubGalleryItemResponseDto> getGallery(Long clubId) {
        if (!clubRepository.existsById(clubId)) {
            throw new ResourceNotFoundException("Club not found with ID: " + clubId);
        }
        return galleryItemRepository.findByClubIdOrderByCreatedAtDesc(clubId)
                .stream()
                .map(ClubGalleryItemResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClubGalleryItemResponseDto addGalleryItem(Long clubId, ClubGalleryItemRequestDto dto, User currentUser) {
        clubAuthorizationService.requireClubManager(currentUser, clubId);

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with ID: " + clubId));

        ClubGalleryItem item = new ClubGalleryItem(
                club,
                dto.getImageUrl(),
                dto.getCaption(),
                currentUser
        );

        ClubGalleryItem saved = galleryItemRepository.save(item);
        return ClubGalleryItemResponseDto.fromEntity(saved);
    }

    @Transactional
    public void deleteGalleryItem(Long clubId, Long itemId, User currentUser) {
        clubAuthorizationService.requireClubManager(currentUser, clubId);

        ClubGalleryItem item = galleryItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery item not found with ID: " + itemId));

        if (!item.getClub().getId().equals(clubId)) {
            throw new IllegalArgumentException("Gallery item does not belong to the specified club.");
        }

        galleryItemRepository.delete(item);
    }

    // =========================================================================
    // Club Achievements
    // =========================================================================

    @Transactional(readOnly = true)
    public List<ClubAchievementResponseDto> getAchievements(Long clubId) {
        if (!clubRepository.existsById(clubId)) {
            throw new ResourceNotFoundException("Club not found with ID: " + clubId);
        }
        return achievementRepository.findByClubIdOrderByAchievementDateDesc(clubId)
                .stream()
                .map(ClubAchievementResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClubAchievementResponseDto addAchievement(Long clubId, ClubAchievementRequestDto dto, User currentUser) {
        clubAuthorizationService.requireClubManager(currentUser, clubId);

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with ID: " + clubId));

        ClubAchievement achievement = new ClubAchievement(
                club,
                dto.getTitle(),
                dto.getDescription(),
                dto.getAchievementDate(),
                dto.getImageUrl()
        );

        ClubAchievement saved = achievementRepository.save(achievement);
        return ClubAchievementResponseDto.fromEntity(saved);
    }

    @Transactional
    public ClubAchievementResponseDto updateAchievement(Long clubId, Long achievementId, ClubAchievementRequestDto dto, User currentUser) {
        clubAuthorizationService.requireClubManager(currentUser, clubId);

        ClubAchievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement not found with ID: " + achievementId));

        if (!achievement.getClub().getId().equals(clubId)) {
            throw new IllegalArgumentException("Achievement does not belong to the specified club.");
        }

        achievement.setTitle(dto.getTitle());
        achievement.setDescription(dto.getDescription());
        achievement.setAchievementDate(dto.getAchievementDate());
        achievement.setImageUrl(dto.getImageUrl());

        ClubAchievement updated = achievementRepository.save(achievement);
        return ClubAchievementResponseDto.fromEntity(updated);
    }

    @Transactional
    public void deleteAchievement(Long clubId, Long achievementId, User currentUser) {
        clubAuthorizationService.requireClubManager(currentUser, clubId);

        ClubAchievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement not found with ID: " + achievementId));

        if (!achievement.getClub().getId().equals(clubId)) {
            throw new IllegalArgumentException("Achievement does not belong to the specified club.");
        }

        achievementRepository.delete(achievement);
    }
}
