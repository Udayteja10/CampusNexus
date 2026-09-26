package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.campuslife.WikiStatus;
import jakarta.validation.constraints.NotNull;

public class WikiModerationDto {

    @NotNull(message = "Status is required (PUBLISHED or REJECTED)")
    private WikiStatus status;

    private String rejectionReason;

    public WikiModerationDto() {
    }

    public WikiModerationDto(WikiStatus status, String rejectionReason) {
        this.status = status;
        this.rejectionReason = rejectionReason;
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
}
