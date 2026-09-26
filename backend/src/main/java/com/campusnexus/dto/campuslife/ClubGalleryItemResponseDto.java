package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.campuslife.ClubGalleryItem;

import java.time.LocalDateTime;

public class ClubGalleryItemResponseDto {

    private Long id;
    private Long clubId;
    private String imageUrl;
    private String caption;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime createdAt;

    public ClubGalleryItemResponseDto() {
    }

    public static ClubGalleryItemResponseDto fromEntity(ClubGalleryItem item) {
        ClubGalleryItemResponseDto dto = new ClubGalleryItemResponseDto();
        dto.setId(item.getId());
        if (item.getClub() != null) {
            dto.setClubId(item.getClub().getId());
        }
        dto.setImageUrl(item.getImageUrl());
        dto.setCaption(item.getCaption());
        if (item.getUploadedBy() != null) {
            dto.setUploadedById(item.getUploadedBy().getId());
            dto.setUploadedByName(item.getUploadedBy().getFullName() != null ? item.getUploadedBy().getFullName() : item.getUploadedBy().getUsername());
        }
        dto.setCreatedAt(item.getCreatedAt());
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public Long getUploadedById() {
        return uploadedById;
    }

    public void setUploadedById(Long uploadedById) {
        this.uploadedById = uploadedById;
    }

    public String getUploadedByName() {
        return uploadedByName;
    }

    public void setUploadedByName(String uploadedByName) {
        this.uploadedByName = uploadedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
