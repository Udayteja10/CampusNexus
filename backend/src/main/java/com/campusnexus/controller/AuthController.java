package com.campusnexus.controller;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.AuthResponse;
import com.campusnexus.dto.ForgotPasswordRequest;
import com.campusnexus.dto.HtnoValidationResponse;
import com.campusnexus.dto.LoginRequest;
import com.campusnexus.dto.RegisterRequest;
import com.campusnexus.dto.RegisterResponse;
import com.campusnexus.dto.ResendOtpRequest;
import com.campusnexus.dto.ResetPasswordRequest;
import com.campusnexus.dto.UserDto;
import com.campusnexus.dto.UsernameAvailabilityResponse;
import com.campusnexus.dto.VerifyOtpRequest;
import com.campusnexus.dto.VerifyResetCodeRequest;
import com.campusnexus.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/username-availability")
    public ResponseEntity<ApiResponse<UsernameAvailabilityResponse>> checkUsernameAvailability(
            @RequestParam(required = false) String username
    ) {
        UsernameAvailabilityResponse response = authService.checkUsernameAvailability(username);
        return ResponseEntity.ok(ApiResponse.success(response.message(), response));
    }

    @GetMapping("/validate-htno")
    public ResponseEntity<ApiResponse<HtnoValidationResponse>> validateHtno(
            @RequestParam(required = false) String htno
    ) {
        HtnoValidationResponse response = authService.validateHtno(htno);
        return ResponseEntity.ok(ApiResponse.success(response.message(), response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest
    ) {
        String ipAddress = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");
        RegisterResponse response = authService.register(request, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response.message(), response));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request,
            HttpServletRequest servletRequest
    ) {
        String ipAddress = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");
        authService.verifyOtp(request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully. You can now log in.", null));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<String>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        String message = authService.resendOtp(request);
        return ResponseEntity.ok(ApiResponse.success(message, message));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest
    ) {
        String ipAddress = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");
        AuthResponse response = authService.login(request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest servletRequest
    ) {
        String ipAddress = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");
        String message = authService.forgotPassword(request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success(message, message));
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<ApiResponse<String>> verifyResetCode(
            @Valid @RequestBody VerifyResetCodeRequest request,
            HttpServletRequest servletRequest
    ) {
        String ipAddress = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");
        String message = authService.verifyResetCode(request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success(message, message));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request,
            HttpServletRequest servletRequest
    ) {
        String ipAddress = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");
        String message = authService.resetPassword(request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success(message, message));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        UserDto user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User details retrieved successfully", user));
    }
}
