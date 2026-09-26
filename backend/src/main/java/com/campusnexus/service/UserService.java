package com.campusnexus.service;

import com.campusnexus.dto.UpdateProfileRequest;
import com.campusnexus.dto.UserDto;

public interface UserService {

    UserDto getProfile(String email);

    UserDto updateProfile(String currentEmail, UpdateProfileRequest request, String ipAddress, String userAgent);
}
