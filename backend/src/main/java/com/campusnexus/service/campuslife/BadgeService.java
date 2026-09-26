package com.campusnexus.service.campuslife;

import com.campusnexus.dto.campuslife.BadgeDto;
import com.campusnexus.dto.campuslife.UserBadgeResponseDto;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.Badge;
import com.campusnexus.entity.campuslife.UserBadge;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.UserRepository;
import com.campusnexus.repository.campuslife.BadgeRepository;
import com.campusnexus.repository.campuslife.UserBadgeRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;

    public BadgeService(BadgeRepository badgeRepository,
                        UserBadgeRepository userBadgeRepository,
                        UserRepository userRepository) {
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<BadgeDto> getAllBadges() {
        return badgeRepository.findAll()
                .stream()
                .map(BadgeDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BadgeDto getBadgeById(Long id) {
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found with ID: " + id));
        return BadgeDto.fromEntity(badge);
    }

    @Transactional(readOnly = true)
    public List<UserBadgeResponseDto> getUserBadges(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }
        return userBadgeRepository.findByUserId(userId)
                .stream()
                .map(UserBadgeResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserBadgeResponseDto> getMyBadges(User currentUser) {
        return userBadgeRepository.findByUserId(currentUser.getId())
                .stream()
                .map(UserBadgeResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserBadgeResponseDto awardBadge(Long targetUserId, Long badgeId, User awardedBy) {
        // Enforce that only Admin or Moderator can award badges
        if (awardedBy.isStudent()) {
            throw new AccessDeniedException("Students cannot award achievement badges.");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found with ID: " + targetUserId));

        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found with ID: " + badgeId));

        if (userBadgeRepository.existsByUserIdAndBadgeId(targetUserId, badgeId)) {
            throw new IllegalArgumentException("User already possesses this achievement badge.");
        }

        UserBadge userBadge = new UserBadge(targetUser, badge, LocalDateTime.now(), awardedBy);
        UserBadge saved = userBadgeRepository.save(userBadge);

        return UserBadgeResponseDto.fromEntity(saved);
    }
}
