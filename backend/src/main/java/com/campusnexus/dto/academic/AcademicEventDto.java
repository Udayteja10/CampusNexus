package com.campusnexus.dto.academic;

import com.campusnexus.entity.academic.AcademicEvent;
import com.campusnexus.entity.academic.AcademicEventType;
import com.campusnexus.entity.academic.EventScope;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class AcademicEventDto {
    private Long id;
    private String title;
    private String description;
    private EventScope scope;
    private Long departmentId;
    private String departmentCode;
    private AcademicEventType eventType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String location;
    private boolean isImportant;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AcademicEventDto() {
    }

    public static AcademicEventDto fromEntity(AcademicEvent event) {
        AcademicEventDto dto = new AcademicEventDto();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setScope(event.getScope());
        if (event.getDepartment() != null) {
            dto.setDepartmentId(event.getDepartment().getId());
            dto.setDepartmentCode(event.getDepartment().getCode());
        }
        dto.setEventType(event.getEventType());
        dto.setStartDate(event.getStartDate());
        dto.setEndDate(event.getEndDate());
        dto.setLocation(event.getLocation());
        dto.setImportant(event.isImportant());
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

    public EventScope getScope() {
        return scope;
    }

    public void setScope(EventScope scope) {
        this.scope = scope;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public AcademicEventType getEventType() {
        return eventType;
    }

    public void setEventType(AcademicEventType eventType) {
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public boolean isImportant() {
        return isImportant;
    }

    public void setImportant(boolean important) {
        isImportant = important;
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

    public static class CreateRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotNull(message = "Event scope is required")
        private EventScope scope;

        private Long departmentId; // Required if scope == DEPARTMENT, must be null if scope == COLLEGE

        @NotNull(message = "Event type is required")
        private AcademicEventType eventType;

        @NotNull(message = "Start date is required")
        private LocalDateTime startDate;

        @NotNull(message = "End date is required")
        private LocalDateTime endDate;

        private String location;

        private boolean isImportant = false;

        public CreateRequest() {
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

        public EventScope getScope() {
            return scope;
        }

        public void setScope(EventScope scope) {
            this.scope = scope;
        }

        public Long getDepartmentId() {
            return departmentId;
        }

        public void setDepartmentId(Long departmentId) {
            this.departmentId = departmentId;
        }

        public AcademicEventType getEventType() {
            return eventType;
        }

        public void setEventType(AcademicEventType eventType) {
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

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public boolean isImportant() {
            return isImportant;
        }

        public void setImportant(boolean important) {
            isImportant = important;
        }
    }
}
