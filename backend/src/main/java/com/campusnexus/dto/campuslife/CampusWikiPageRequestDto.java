package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.campuslife.CampusWikiCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CampusWikiPageRequestDto {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    @Size(max = 255, message = "Slug cannot exceed 255 characters")
    private String slug;

    @NotBlank(message = "Content is required")
    private String content;

    @NotNull(message = "Category is required")
    private CampusWikiCategory category;

    public CampusWikiPageRequestDto() {
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
}
