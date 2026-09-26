package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.campuslife.Badge;

import java.time.LocalDateTime;

public class BadgeDto {

    private Long id;
    private String name;
    private String description;
    private String icon;
    private String criteria;
    private LocalDateTime createdAt;

    public BadgeDto() {
    }

    public static BadgeDto fromEntity(Badge badge) {
        BadgeDto dto = new BadgeDto();
        dto.setId(badge.getId());
        dto.setName(badge.getName());
        dto.setDescription(badge.getDescription());
        dto.setIcon(badge.getIcon());
        dto.setCriteria(badge.getCriteria());
        dto.setCreatedAt(badge.getCreatedAt());
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getCriteria() {
        return criteria;
    }

    public void setCriteria(String criteria) {
        this.criteria = criteria;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
