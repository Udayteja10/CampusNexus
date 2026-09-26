package com.campusnexus.dto.campuslife;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AssignClubPresidentRequestDto {

    @NotNull(message = "User ID is required")
    private Long userId;

    @Size(max = 100, message = "Designation cannot exceed 100 characters")
    private String designation = "PRESIDENT";

    public AssignClubPresidentRequestDto() {
    }

    public AssignClubPresidentRequestDto(Long userId, String designation) {
        this.userId = userId;
        this.designation = designation != null ? designation : "PRESIDENT";
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }
}
