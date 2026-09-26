package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.campuslife.ItemCondition;
import com.campusnexus.entity.campuslife.ListingStatus;
import com.campusnexus.entity.campuslife.MarketplaceCategory;
import com.campusnexus.entity.campuslife.MarketplaceListing;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MarketplaceListingResponseDto {

    private Long id;
    private Long sellerId;
    private String sellerName;
    private String sellerEmail;
    private String sellerDepartment;
    private String title;
    private String description;
    private MarketplaceCategory category;
    private BigDecimal price;
    private ItemCondition conditionType;
    private String imageUrl;
    private String contactPhone;
    private ListingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MarketplaceListingResponseDto() {
    }

    public static MarketplaceListingResponseDto fromEntity(MarketplaceListing item) {
        MarketplaceListingResponseDto dto = new MarketplaceListingResponseDto();
        dto.setId(item.getId());
        if (item.getSeller() != null) {
            dto.setSellerId(item.getSeller().getId());
            dto.setSellerName(item.getSeller().getFullName() != null ? item.getSeller().getFullName() : item.getSeller().getUsername());
            dto.setSellerEmail(item.getSeller().getEmail());
            try {
                if (item.getSeller().getDepartment() != null) {
                    dto.setSellerDepartment(item.getSeller().getDepartment().getCode());
                }
            } catch (Exception ignored) {
            }
        }
        dto.setTitle(item.getTitle());
        dto.setDescription(item.getDescription());
        dto.setCategory(item.getCategory());
        dto.setPrice(item.getPrice());
        dto.setConditionType(item.getConditionType());
        dto.setImageUrl(item.getImageUrl());
        dto.setContactPhone(item.getContactPhone());
        dto.setStatus(item.getStatus());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSellerId() {
        return sellerId;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }

    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }

    public String getSellerEmail() {
        return sellerEmail;
    }

    public void setSellerEmail(String sellerEmail) {
        this.sellerEmail = sellerEmail;
    }

    public String getSellerDepartment() {
        return sellerDepartment;
    }

    public void setSellerDepartment(String sellerDepartment) {
        this.sellerDepartment = sellerDepartment;
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

    public MarketplaceCategory getCategory() {
        return category;
    }

    public void setCategory(MarketplaceCategory category) {
        this.category = category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public ItemCondition getConditionType() {
        return conditionType;
    }

    public void setConditionType(ItemCondition conditionType) {
        this.conditionType = conditionType;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public ListingStatus getStatus() {
        return status;
    }

    public void setStatus(ListingStatus status) {
        this.status = status;
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
