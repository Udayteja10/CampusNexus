package com.campusnexus.service;

public interface EmailService {

    /**
     * Sends a 6-digit OTP verification email with personalized student name.
     * Note: OTP is NEVER logged to preserve security.
     */
    void sendVerificationOtp(String toEmail, String fullName, String otp, int validityMinutes);

    /**
     * Overloaded method for backward-compatibility.
     */
    void sendVerificationOtp(String toEmail, String otp, int validityMinutes);

    /**
     * Sends a 6-digit password reset OTP email with personalized user name.
     * Note: OTP is NEVER logged to preserve security.
     */
    void sendPasswordResetOtp(String toEmail, String fullName, String otp, int validityMinutes);

    /**
     * Overloaded method for backward-compatibility.
     */
    void sendPasswordResetOtp(String toEmail, String otp, int validityMinutes);

    /**
     * Safe internal SMTP configuration status check (zero credentials leaked).
     */
    SmtpStatus getSmtpStatus();

    record SmtpStatus(
            boolean configured,
            String host,
            int port,
            String fromAddress,
            boolean authEnabled,
            boolean starttlsEnabled,
            String statusMessage
    ) {}
}
