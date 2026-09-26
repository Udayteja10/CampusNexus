package com.campusnexus.dto;

import jakarta.validation.constraints.NotNull;

public record AssignCoordinatorRequest(
        @NotNull(message = "User ID is required")
        Long userId,

        @NotNull(message = "Department ID is required")
        Long departmentId
) {
}
