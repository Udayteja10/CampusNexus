package com.campusnexus.dto;

import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;

public record UserDto(
        Long id,
        String email,
        String fullName,
        String username,
        boolean emailVerified,
        Role role,
        Integer admissionYear,
        String regulation,
        Integer yearOfStudy,
        String department,
        String htno,
        String coordinatorDepartment
) {
    public static UserDto fromEntity(User user) {
        if (user == null) {
            return null;
        }
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getUsername(),
                user.isEmailVerified(),
                user.getRole(),
                user.getAdmissionYear(),
                user.getRegulation(),
                user.getYearOfStudy(),
                user.getDepartment() != null ? user.getDepartment().getCode() : null,
                user.getHtno(),
                user.getCoordinatorDepartment() != null ? user.getCoordinatorDepartment().getCode() : null
        );
    }
}
