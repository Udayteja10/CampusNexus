package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.campuslife.ReportStatus;
import jakarta.validation.constraints.NotNull;

public class LostFoundStatusUpdateDto {

    @NotNull(message = "Status is required")
    private ReportStatus status;

    public LostFoundStatusUpdateDto() {
    }

    public LostFoundStatusUpdateDto(ReportStatus status) {
        this.status = status;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }
}
