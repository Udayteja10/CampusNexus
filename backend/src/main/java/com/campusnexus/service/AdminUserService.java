package com.campusnexus.service;

import com.campusnexus.dto.AdminUserDto;
import com.campusnexus.dto.UpdateUserRoleRequest;
import com.campusnexus.dto.UpdateUserStatusRequest;
import com.campusnexus.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminUserService {

    Page<AdminUserDto> getAdminUsers(String search, Role role, String status, Pageable pageable);

    AdminUserDto updateUserStatus(Long userId, UpdateUserStatusRequest request, String actorEmail, String ipAddress, String userAgent);

    AdminUserDto updateUserRole(Long userId, UpdateUserRoleRequest request, String actorEmail, String ipAddress, String userAgent);
}
