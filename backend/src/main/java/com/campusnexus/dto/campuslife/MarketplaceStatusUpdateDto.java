package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.campuslife.ListingStatus;
import jakarta.validation.constraints.NotNull;

public class MarketplaceStatusUpdateDto {

    @NotNull(message = "Status is required")
    private ListingStatus status;

    public MarketplaceStatusUpdateDto() {
    }

    public MarketplaceStatusUpdateDto(ListingStatus status) {
        this.status = status;
    }

    public ListingStatus getStatus() {
        return status;
    }

    public void setStatus(ListingStatus status) {
        this.status = status;
    }
}
