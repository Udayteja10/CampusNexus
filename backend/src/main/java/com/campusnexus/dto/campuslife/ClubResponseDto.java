package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.campuslife.Club;
import com.campusnexus.entity.campuslife.ClubCategory;

import java.time.LocalDateTime;

public class ClubResponseDto {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private ClubCategory category;
    private String logoUrl;
    private String coverUrl;
    private String contactEmail;
    private String socialLinks;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private ClubPresidentDto currentPresident;
    private boolean canManage;

    public ClubResponseDto() {
    }

    public static ClubResponseDto fromEntity(Club club) {
        return fromEntity(club, null, false);
    }

    public static ClubResponseDto fromEntity(Club club, ClubPresidentDto president, boolean canManage) {
        ClubResponseDto dto = new ClubResponseDto();
        dto.setId(club.getId());
        dto.setName(club.getName());
        dto.setSlug(club.getSlug());
        dto.setDescription(club.getDescription());
        dto.setCategory(club.getCategory());
        dto.setLogoUrl(club.getLogoUrl());
        dto.setCoverUrl(club.getCoverUrl());
        dto.setContactEmail(club.getContactEmail());
        dto.setSocialLinks(club.getSocialLinks());
        dto.setStatus(club.getStatus());
        dto.setCreatedAt(club.getCreatedAt());
        dto.setUpdatedAt(club.getUpdatedAt());
        dto.setCurrentPresident(president);
        dto.setCanManage(canManage);
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ClubCategory getCategory() {
        return category;
    }

    public void setCategory(ClubCategory category) {
        this.category = category;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getSocialLinks() {
        return socialLinks;
    }

    public void setSocialLinks(String socialLinks) {
        this.socialLinks = socialLinks;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public ClubPresidentDto getCurrentPresident() {
        return currentPresident;
    }

    public void setCurrentPresident(ClubPresidentDto currentPresident) {
        this.currentPresident = currentPresident;
    }

    public boolean isCanManage() {
        return canManage;
    }

    public void setCanManage(boolean canManage) {
        this.canManage = canManage;
    }
}
