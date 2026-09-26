package com.campusnexus.dto.campuslife;

import jakarta.validation.constraints.NotBlank;

public class UpdateClubStatusRequestDto {

    @NotBlank(message = "Status is required (ACTIVE / INACTIVE)")
    private String status;

    public UpdateClubStatusRequestDto() {
    }

    public UpdateClubStatusRequestDto(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
