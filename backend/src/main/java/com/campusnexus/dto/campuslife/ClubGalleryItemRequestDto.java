package com.campusnexus.dto.campuslife;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ClubGalleryItemRequestDto {

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    @Size(max = 255, message = "Caption cannot exceed 255 characters")
    private String caption;

    public ClubGalleryItemRequestDto() {
    }

    public ClubGalleryItemRequestDto(String imageUrl, String caption) {
        this.imageUrl = imageUrl;
        this.caption = caption;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }
}
