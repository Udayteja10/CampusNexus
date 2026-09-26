package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.campuslife.ClubAchievement;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ClubAchievementResponseDto {

    private Long id;
    private Long clubId;
    private String title;
    private String description;
    private LocalDate achievementDate;
    private String imageUrl;
    private LocalDateTime createdAt;

    public ClubAchievementResponseDto() {
    }

    public static ClubAchievementResponseDto fromEntity(ClubAchievement ach) {
        ClubAchievementResponseDto dto = new ClubAchievementResponseDto();
        dto.setId(ach.getId());
        if (ach.getClub() != null) {
            dto.setClubId(ach.getClub().getId());
        }
        dto.setTitle(ach.getTitle());
        dto.setDescription(ach.getDescription());
        dto.setAchievementDate(ach.getAchievementDate());
        dto.setImageUrl(ach.getImageUrl());
        dto.setCreatedAt(ach.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClubId() {
        return clubId;
    }

    public void setClubId(Long clubId) {
        this.clubId = clubId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getAchievementDate() {
        return achievementDate;
    }

    public void setAchievementDate(LocalDate achievementDate) {
        this.achievementDate = achievementDate;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
