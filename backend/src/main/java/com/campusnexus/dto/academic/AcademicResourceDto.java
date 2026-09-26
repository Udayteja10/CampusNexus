package com.campusnexus.dto.academic;

import com.campusnexus.entity.academic.AcademicResource;
import com.campusnexus.entity.academic.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class AcademicResourceDto {
    private Long id;
    private String title;
    private String description;
    private Long departmentId;
    private String departmentCode;
    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    private Integer semester;
    private ResourceType resourceType;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private Long uploaderId;
    private String uploaderEmail;
    private boolean isVerifiedByCoordinator;
    private Long verifiedById;
    private LocalDateTime verifiedAt;
    private Integer downloadsCount;
    private Integer upvotesCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AcademicResourceDto() {
    }

    public static AcademicResourceDto fromEntity(AcademicResource resource) {
        AcademicResourceDto dto = new AcademicResourceDto();
        dto.setId(resource.getId());
        dto.setTitle(resource.getTitle());
        dto.setDescription(resource.getDescription());
        if (resource.getDepartment() != null) {
            dto.setDepartmentId(resource.getDepartment().getId());
            dto.setDepartmentCode(resource.getDepartment().getCode());
        }
        if (resource.getSubject() != null) {
            dto.setSubjectId(resource.getSubject().getId());
        }
        dto.setSubjectCode(resource.getSubjectCode());
        dto.setSubjectName(resource.getSubjectName());
        dto.setSemester(resource.getSemester());
        dto.setResourceType(resource.getResourceType());
        dto.setFileUrl(resource.getFileUrl());
        dto.setFileType(resource.getFileType());
        dto.setFileSize(resource.getFileSize());
        if (resource.getUploader() != null) {
            dto.setUploaderId(resource.getUploader().getId());
            dto.setUploaderEmail(resource.getUploader().getEmail());
        }
        dto.setVerifiedByCoordinator(resource.isVerifiedByCoordinator());
        if (resource.getVerifiedBy() != null) {
            dto.setVerifiedById(resource.getVerifiedBy().getId());
        }
        dto.setVerifiedAt(resource.getVerifiedAt());
        dto.setDownloadsCount(resource.getDownloadsCount());
        dto.setUpvotesCount(resource.getUpvotesCount());
        dto.setCreatedAt(resource.getCreatedAt());
        dto.setUpdatedAt(resource.getUpdatedAt());
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

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public ResourceType getResourceType() {
        return resourceType;
    }

    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Long getUploaderId() {
        return uploaderId;
    }

    public void setUploaderId(Long uploaderId) {
        this.uploaderId = uploaderId;
    }

    public String getUploaderEmail() {
        return uploaderEmail;
    }

    public void setUploaderEmail(String uploaderEmail) {
        this.uploaderEmail = uploaderEmail;
    }

    public boolean isVerifiedByCoordinator() {
        return isVerifiedByCoordinator;
    }

    public void setVerifiedByCoordinator(boolean verifiedByCoordinator) {
        isVerifiedByCoordinator = verifiedByCoordinator;
    }

    public Long getVerifiedById() {
        return verifiedById;
    }

    public void setVerifiedById(Long verifiedById) {
        this.verifiedById = verifiedById;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public Integer getDownloadsCount() {
        return downloadsCount;
    }

    public void setDownloadsCount(Integer downloadsCount) {
        this.downloadsCount = downloadsCount;
    }

    public Integer getUpvotesCount() {
        return upvotesCount;
    }

    public void setUpvotesCount(Integer upvotesCount) {
        this.upvotesCount = upvotesCount;
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

        private Long departmentId; // Optional for student (derived from auth)

        private Long subjectId;

        private String subjectCode;

        private String subjectName;

        @NotNull(message = "Semester is required")
        private Integer semester;

        @NotNull(message = "Resource type is required")
        private ResourceType resourceType;

        @NotBlank(message = "File URL is required")
        private String fileUrl;

        private String fileType;

        private Long fileSize;

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

        public Long getDepartmentId() {
            return departmentId;
        }

        public void setDepartmentId(Long departmentId) {
            this.departmentId = departmentId;
        }

        public Long getSubjectId() {
            return subjectId;
        }

        public void setSubjectId(Long subjectId) {
            this.subjectId = subjectId;
        }

        public String getSubjectCode() {
            return subjectCode;
        }

        public void setSubjectCode(String subjectCode) {
            this.subjectCode = subjectCode;
        }

        public String getSubjectName() {
            return subjectName;
        }

        public void setSubjectName(String subjectName) {
            this.subjectName = subjectName;
        }

        public Integer getSemester() {
            return semester;
        }

        public void setSemester(Integer semester) {
            this.semester = semester;
        }

        public ResourceType getResourceType() {
            return resourceType;
        }

        public void setResourceType(ResourceType resourceType) {
            this.resourceType = resourceType;
        }

        public String getFileUrl() {
            return fileUrl;
        }

        public void setFileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
        }

        public String getFileType() {
            return fileType;
        }

        public void setFileType(String fileType) {
            this.fileType = fileType;
        }

        public Long getFileSize() {
            return fileSize;
        }

        public void setFileSize(Long fileSize) {
            this.fileSize = fileSize;
        }
    }
}
