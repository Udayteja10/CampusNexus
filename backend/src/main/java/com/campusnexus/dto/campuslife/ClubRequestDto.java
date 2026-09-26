package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.campuslife.ClubCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ClubRequestDto {

    @NotBlank(message = "Club name is required")
    @Size(max = 150, message = "Club name cannot exceed 150 characters")
    private String name;

    @NotBlank(message = "Slug is required")
    @Size(max = 150, message = "Slug cannot exceed 150 characters")
    private String slug;

    private String description;

    @NotNull(message = "Category is required")
    private ClubCategory category;

    private String logoUrl;
    private String coverUrl;
    private String contactEmail;
    private String socialLinks;
    private String status = "ACTIVE";

    public ClubRequestDto() {
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
}
