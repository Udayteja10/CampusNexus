package com.campusnexus.dto.campuslife;

import jakarta.validation.constraints.NotNull;

public class AwardBadgeRequestDto {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Badge ID is required")
    private Long badgeId;

    public AwardBadgeRequestDto() {
    }

    public AwardBadgeRequestDto(Long userId, Long badgeId) {
        this.userId = userId;
        this.badgeId = badgeId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getBadgeId() {
        return badgeId;
    }

    public void setBadgeId(Long badgeId) {
        this.badgeId = badgeId;
    }
}
