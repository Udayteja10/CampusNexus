package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.campuslife.CampusWikiCategory;
import com.campusnexus.entity.campuslife.CampusWikiPage;
import com.campusnexus.entity.campuslife.WikiStatus;

import java.time.LocalDateTime;

public class CampusWikiPageResponseDto {

    private Long id;
    private String title;
    private String slug;
    private String content;
    private CampusWikiCategory category;
    private Long authorId;
    private String authorName;
    private String authorEmail;
    private WikiStatus status;
    private String rejectionReason;
    private Integer viewsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CampusWikiPageResponseDto() {
    }

    public static CampusWikiPageResponseDto fromEntity(CampusWikiPage page) {
        CampusWikiPageResponseDto dto = new CampusWikiPageResponseDto();
        dto.setId(page.getId());
        dto.setTitle(page.getTitle());
        dto.setSlug(page.getSlug());
        dto.setContent(page.getContent());
        dto.setCategory(page.getCategory());
        if (page.getAuthor() != null) {
            dto.setAuthorId(page.getAuthor().getId());
            dto.setAuthorName(page.getAuthor().getFullName() != null ? page.getAuthor().getFullName() : page.getAuthor().getUsername());
            dto.setAuthorEmail(page.getAuthor().getEmail());
        }
        dto.setStatus(page.getStatus());
        dto.setRejectionReason(page.getRejectionReason());
        dto.setViewsCount(page.getViewsCount());
        dto.setCreatedAt(page.getCreatedAt());
        dto.setUpdatedAt(page.getUpdatedAt());
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

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public CampusWikiCategory getCategory() {
        return category;
    }

    public void setCategory(CampusWikiCategory category) {
        this.category = category;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getAuthorEmail() {
        return authorEmail;
    }

    public void setAuthorEmail(String authorEmail) {
        this.authorEmail = authorEmail;
    }

    public WikiStatus getStatus() {
        return status;
    }

    public void setStatus(WikiStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Integer getViewsCount() {
        return viewsCount;
    }

    public void setViewsCount(Integer viewsCount) {
        this.viewsCount = viewsCount;
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
