package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.campuslife.ClubPresident;

import java.time.LocalDateTime;

public class ClubPresidentDto {

    private Long id;
    private Long clubId;
    private String clubName;
    private String clubSlug;
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String htno;
    private String designation;
    private boolean active;
    private LocalDateTime assignedAt;
    private String assignedByName;
    private LocalDateTime removedAt;
    private String removedByName;

    public ClubPresidentDto() {
    }

    public static ClubPresidentDto fromEntity(ClubPresident cp) {
        if (cp == null) return null;
        ClubPresidentDto dto = new ClubPresidentDto();
        dto.setId(cp.getId());
        if (cp.getClub() != null) {
            dto.setClubId(cp.getClub().getId());
            dto.setClubName(cp.getClub().getName());
            dto.setClubSlug(cp.getClub().getSlug());
        }
        if (cp.getUser() != null) {
            dto.setUserId(cp.getUser().getId());
            dto.setUsername(cp.getUser().getUsername());
            dto.setFullName(cp.getUser().getFullName());
            dto.setEmail(cp.getUser().getEmail());
            dto.setHtno(cp.getUser().getHtno());
        }
        dto.setDesignation(cp.getDesignation());
        dto.setActive(cp.isActive());
        dto.setAssignedAt(cp.getAssignedAt());
        if (cp.getAssignedBy() != null) {
            dto.setAssignedByName(cp.getAssignedBy().getFullName() != null ? cp.getAssignedBy().getFullName() : cp.getAssignedBy().getUsername());
        }
        dto.setRemovedAt(cp.getRemovedAt());
        if (cp.getRemovedBy() != null) {
            dto.setRemovedByName(cp.getRemovedBy().getFullName() != null ? cp.getRemovedBy().getFullName() : cp.getRemovedBy().getUsername());
        }
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

    public String getClubSlug() {
        return clubSlug;
    }

    public void setClubSlug(String clubSlug) {
        this.clubSlug = clubSlug;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getHtno() {
        return htno;
    }

    public void setHtno(String htno) {
        this.htno = htno;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public String getAssignedByName() {
        return assignedByName;
    }

    public void setAssignedByName(String assignedByName) {
        this.assignedByName = assignedByName;
    }

    public LocalDateTime getRemovedAt() {
        return removedAt;
    }

    public void setRemovedAt(LocalDateTime removedAt) {
        this.removedAt = removedAt;
    }

    public String getRemovedByName() {
        return removedByName;
    }

    public void setRemovedByName(String removedByName) {
        this.removedByName = removedByName;
    }
}
