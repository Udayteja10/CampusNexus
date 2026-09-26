package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.campuslife.AcademicCalendarEvent;
import com.campusnexus.entity.campuslife.CalendarEventType;

import java.time.LocalDateTime;

public class CalendarEventResponseDto {

    private Long id;
    private String title;
    private String description;
    private CalendarEventType eventType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean allDay;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private Integer yearOfStudy;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CalendarEventResponseDto() {
    }

    public static CalendarEventResponseDto fromEntity(AcademicCalendarEvent event) {
        CalendarEventResponseDto dto = new CalendarEventResponseDto();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setEventType(event.getEventType());
        dto.setStartDate(event.getStartDate());
        dto.setEndDate(event.getEndDate());
        dto.setAllDay(event.isAllDay());
        if (event.getDepartment() != null) {
            dto.setDepartmentId(event.getDepartment().getId());
            dto.setDepartmentName(event.getDepartment().getName());
            dto.setDepartmentCode(event.getDepartment().getCode());
        }
        dto.setYearOfStudy(event.getYearOfStudy());
        if (event.getCreatedBy() != null) {
            dto.setCreatedById(event.getCreatedBy().getId());
            dto.setCreatedByName(event.getCreatedBy().getFullName() != null ? event.getCreatedBy().getFullName() : event.getCreatedBy().getEmail());
        }
        dto.setCreatedAt(event.getCreatedAt());
        dto.setUpdatedAt(event.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public CalendarEventType getEventType() {
        return eventType;
    }

    public void setEventType(CalendarEventType eventType) {
        this.eventType = eventType;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public boolean isAllDay() {
        return allDay;
    }

    public void setAllDay(boolean allDay) {
        this.allDay = allDay;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public Integer getYearOfStudy() {
        return yearOfStudy;
    }

    public void setYearOfStudy(Integer yearOfStudy) {
        this.yearOfStudy = yearOfStudy;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
