package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.campuslife.UserBadge;

import java.time.LocalDateTime;

public class UserBadgeResponseDto {

    private Long id;
    private Long badgeId;
    private String badgeName;
    private String badgeDescription;
    private String badgeIcon;
    private String badgeCriteria;
    private LocalDateTime awardedAt;
    private Long awardedById;
    private String awardedByName;

    public UserBadgeResponseDto() {
    }

    public static UserBadgeResponseDto fromEntity(UserBadge userBadge) {
        UserBadgeResponseDto dto = new UserBadgeResponseDto();
        dto.setId(userBadge.getId());
        if (userBadge.getBadge() != null) {
            dto.setBadgeId(userBadge.getBadge().getId());
            dto.setBadgeName(userBadge.getBadge().getName());
            dto.setBadgeDescription(userBadge.getBadge().getDescription());
            dto.setBadgeIcon(userBadge.getBadge().getIcon());
            dto.setBadgeCriteria(userBadge.getBadge().getCriteria());
        }
        dto.setAwardedAt(userBadge.getAwardedAt());
        if (userBadge.getAwardedBy() != null) {
            dto.setAwardedById(userBadge.getAwardedBy().getId());
            dto.setAwardedByName(userBadge.getAwardedBy().getFullName() != null ? userBadge.getAwardedBy().getFullName() : userBadge.getAwardedBy().getUsername());
        }
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBadgeId() {
        return badgeId;
    }

    public void setBadgeId(Long badgeId) {
        this.badgeId = badgeId;
    }

    public String getBadgeName() {
        return badgeName;
    }

    public void setBadgeName(String badgeName) {
        this.badgeName = badgeName;
    }

    public String getBadgeDescription() {
        return badgeDescription;
    }

    public void setBadgeDescription(String badgeDescription) {
        this.badgeDescription = badgeDescription;
    }

    public String getBadgeIcon() {
        return badgeIcon;
    }

    public void setBadgeIcon(String badgeIcon) {
        this.badgeIcon = badgeIcon;
    }

    public String getBadgeCriteria() {
        return badgeCriteria;
    }

    public void setBadgeCriteria(String badgeCriteria) {
        this.badgeCriteria = badgeCriteria;
    }

    public LocalDateTime getAwardedAt() {
        return awardedAt;
    }

    public void setAwardedAt(LocalDateTime awardedAt) {
        this.awardedAt = awardedAt;
    }

    public Long getAwardedById() {
        return awardedById;
    }

    public void setAwardedById(Long awardedById) {
        this.awardedById = awardedById;
    }

    public String getAwardedByName() {
        return awardedByName;
    }

    public void setAwardedByName(String awardedByName) {
        this.awardedByName = awardedByName;
    }
}
