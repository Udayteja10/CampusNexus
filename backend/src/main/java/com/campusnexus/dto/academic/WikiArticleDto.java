package com.campusnexus.dto.academic;

import com.campusnexus.entity.academic.WikiArticle;
import com.campusnexus.entity.academic.WikiCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class WikiArticleDto {
    private Long id;
    private String slug;
    private String title;
    private String content;
    private WikiCategory category;
    private Long departmentId;
    private String departmentCode;
    private Long authorId;
    private String authorEmail;
    private Integer viewsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WikiArticleDto() {
    }

    public static WikiArticleDto fromEntity(WikiArticle article) {
        WikiArticleDto dto = new WikiArticleDto();
        dto.setId(article.getId());
        dto.setSlug(article.getSlug());
        dto.setTitle(article.getTitle());
        dto.setContent(article.getContent());
        dto.setCategory(article.getCategory());
        if (article.getDepartment() != null) {
            dto.setDepartmentId(article.getDepartment().getId());
            dto.setDepartmentCode(article.getDepartment().getCode());
        }
        if (article.getAuthor() != null) {
            dto.setAuthorId(article.getAuthor().getId());
            dto.setAuthorEmail(article.getAuthor().getEmail());
        }
        dto.setViewsCount(article.getViewsCount());
        dto.setCreatedAt(article.getCreatedAt());
        dto.setUpdatedAt(article.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
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

    public WikiCategory getCategory() {
        return category;
    }

    public void setCategory(WikiCategory category) {
        this.category = category;
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

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public String getAuthorEmail() {
        return authorEmail;
    }

    public void setAuthorEmail(String authorEmail) {
        this.authorEmail = authorEmail;
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

    public static class CreateRequest {
        @NotBlank(message = "Slug is required")
        private String slug;

        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Content is required")
        private String content;

        @NotNull(message = "Category is required")
        private WikiCategory category;

        private Long departmentId; // Optional metadata only

        public CreateRequest() {
        }

        public String getSlug() {
            return slug;
        }

        public void setSlug(String slug) {
            this.slug = slug;
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

        public WikiCategory getCategory() {
            return category;
        }

        public void setCategory(WikiCategory category) {
            this.category = category;
        }

        public Long getDepartmentId() {
            return departmentId;
        }

        public void setDepartmentId(Long departmentId) {
            this.departmentId = departmentId;
        }
    }
}
