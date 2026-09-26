package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.campuslife.LostFoundCategory;
import com.campusnexus.entity.campuslife.LostFoundReport;
import com.campusnexus.entity.campuslife.LostFoundType;
import com.campusnexus.entity.campuslife.ReportStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class LostFoundReportResponseDto {

    private Long id;
    private LostFoundType type;
    private String title;
    private String description;
    private LostFoundCategory category;
    private String location;
    private LocalDate eventDate;
    private String imageUrl;
    private String contactInfo;
    private ReportStatus status;
    private Long reportedById;
    private String reportedByName;
    private String reportedByEmail;
    private String reportedByDepartment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public LostFoundReportResponseDto() {
    }

    public static LostFoundReportResponseDto fromEntity(LostFoundReport report) {
        LostFoundReportResponseDto dto = new LostFoundReportResponseDto();
        dto.setId(report.getId());
        dto.setType(report.getType());
        dto.setTitle(report.getTitle());
        dto.setDescription(report.getDescription());
        dto.setCategory(report.getCategory());
        dto.setLocation(report.getLocation());
        dto.setEventDate(report.getEventDate());
        dto.setImageUrl(report.getImageUrl());
        dto.setContactInfo(report.getContactInfo());
        dto.setStatus(report.getStatus());
        if (report.getReportedBy() != null) {
            dto.setReportedById(report.getReportedBy().getId());
            dto.setReportedByName(report.getReportedBy().getFullName() != null ? report.getReportedBy().getFullName() : report.getReportedBy().getUsername());
            dto.setReportedByEmail(report.getReportedBy().getEmail());
            try {
                if (report.getReportedBy().getDepartment() != null) {
                    dto.setReportedByDepartment(report.getReportedBy().getDepartment().getCode());
                }
            } catch (Exception ignored) {
            }
        }
        dto.setCreatedAt(report.getCreatedAt());
        dto.setUpdatedAt(report.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LostFoundType getType() {
        return type;
    }

    public void setType(LostFoundType type) {
        this.type = type;
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

    public LostFoundCategory getCategory() {
        return category;
    }

    public void setCategory(LostFoundCategory category) {
        this.category = category;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getContactInfo() {
        return contactInfo;
    }

    public void setContactInfo(String contactInfo) {
        this.contactInfo = contactInfo;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public Long getReportedById() {
        return reportedById;
    }

    public void setReportedById(Long reportedById) {
        this.reportedById = reportedById;
    }

    public String getReportedByName() {
        return reportedByName;
    }

    public void setReportedByName(String reportedByName) {
        this.reportedByName = reportedByName;
    }

    public String getReportedByEmail() {
        return reportedByEmail;
    }

    public void setReportedByEmail(String reportedByEmail) {
        this.reportedByEmail = reportedByEmail;
    }

    public String getReportedByDepartment() {
        return reportedByDepartment;
    }

    public void setReportedByDepartment(String reportedByDepartment) {
        this.reportedByDepartment = reportedByDepartment;
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
}
