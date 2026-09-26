package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.campuslife.ClubAnnouncement;

import java.time.LocalDateTime;

public class ClubAnnouncementResponseDto {

    private Long id;
    private Long clubId;
    private String clubName;
    private String title;
    private String content;
    private LocalDateTime publishedAt;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;

    public ClubAnnouncementResponseDto() {
    }

    public static ClubAnnouncementResponseDto fromEntity(ClubAnnouncement ann) {
        ClubAnnouncementResponseDto dto = new ClubAnnouncementResponseDto();
        dto.setId(ann.getId());
        if (ann.getClub() != null) {
            dto.setClubId(ann.getClub().getId());
            dto.setClubName(ann.getClub().getName());
        }
        dto.setTitle(ann.getTitle());
        dto.setContent(ann.getContent());
        dto.setPublishedAt(ann.getPublishedAt());
        if (ann.getCreatedBy() != null) {
            dto.setCreatedById(ann.getCreatedBy().getId());
            dto.setCreatedByName(ann.getCreatedBy().getFullName() != null ? ann.getCreatedBy().getFullName() : ann.getCreatedBy().getUsername());
        }
        dto.setCreatedAt(ann.getCreatedAt());
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

    public String getClubName() {
        return clubName;
    }

    public void setClubName(String clubName) {
        this.clubName = clubName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
