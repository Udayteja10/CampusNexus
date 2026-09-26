package com.campusnexus.dto;

import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;

import java.time.LocalDateTime;

public record AdminUserDto(
        Long id,
        String username,
        String email,
        String fullName,
        String htno,
        Role role,
        boolean enabled,
        boolean emailVerified,
        String departmentName,
        Integer yearOfStudy,
        String regulation,
        Integer admissionYear,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static AdminUserDto fromEntity(User user) {
        String dept = user.getDepartment() != null
                ? user.getDepartment().getName()
                : (user.getCoordinatorDepartment() != null ? user.getCoordinatorDepartment().getName() : null);

        return new AdminUserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : user.getUsername(),
                user.getHtno(),
                user.getRole(),
                user.isEnabled(),
                user.isEmailVerified(),
                dept,
                user.getYearOfStudy(),
                user.getRegulation(),
                user.getAdmissionYear(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
