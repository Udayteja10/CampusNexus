package com.campusnexus.service.campuslife;

import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.Club;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.campuslife.ClubPresidentRepository;
import com.campusnexus.repository.campuslife.ClubRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClubAuthorizationService {

    private final ClubPresidentRepository clubPresidentRepository;
    private final ClubRepository clubRepository;

    public ClubAuthorizationService(ClubPresidentRepository clubPresidentRepository,
                                    ClubRepository clubRepository) {
        this.clubPresidentRepository = clubPresidentRepository;
        this.clubRepository = clubRepository;
    }

    public boolean isAdmin(User user) {
        return user != null && user.isEnabled() && user.isAdmin();
    }

    @Transactional(readOnly = true)
    public boolean isClubPresident(Long userId, Long clubId) {
        if (userId == null || clubId == null) return false;
        return clubPresidentRepository.existsByClubIdAndUserIdAndActiveTrue(clubId, userId);
    }

    @Transactional(readOnly = true)
    public boolean isClubPresident(User user, Long clubId) {
        if (user == null || !user.isEnabled() || clubId == null) return false;
        return isClubPresident(user.getId(), clubId);
    }

    @Transactional(readOnly = true)
    public boolean canManageClub(User user, Long clubId) {
        if (user == null || !user.isEnabled() || clubId == null) return false;
        if (user.isAdmin()) return true;

        Club club = clubRepository.findById(clubId).orElse(null);
        if (club == null || !"ACTIVE".equalsIgnoreCase(club.getStatus())) {
            return false;
        }

        return isClubPresident(user.getId(), clubId);
    }

    @Transactional(readOnly = true)
    public void requireClubManager(User user, Long clubId) {
        if (user == null || !user.isEnabled()) {
            throw new AccessDeniedException("Unauthenticated or disabled user.");
        }

        if (user.isAdmin()) {
            return;
        }

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with ID: " + clubId));

        if (!"ACTIVE".equalsIgnoreCase(club.getStatus())) {
            throw new AccessDeniedException("This club is currently inactive and cannot be modified.");
        }

        if (!isClubPresident(user.getId(), clubId)) {
            throw new AccessDeniedException("Access denied: You are not authorized to manage " + club.getName() + ".");
        }
    }

    public void requireAdmin(User user) {
        if (user == null || !user.isEnabled() || !user.isAdmin()) {
            throw new AccessDeniedException("Unauthorized: Administrator access required.");
        }
    }
}
