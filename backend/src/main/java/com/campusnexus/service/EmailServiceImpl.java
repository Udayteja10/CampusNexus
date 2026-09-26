package com.campusnexus.service;

import com.campusnexus.exception.EmailDeliveryException;
import com.campusnexus.exception.EmailDeliveryException.FailureReason;
import jakarta.mail.AuthenticationFailedException;
import jakarta.mail.MessagingException;
import jakarta.mail.SendFailedException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.mail.MailParseException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;
import java.util.Optional;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final Optional<JavaMailSender> mailSender;
    private final String mailHost;
    private final int mailPort;
    private final String mailUsername;
    private final String mailPassword;
    private final boolean smtpAuth;
    private final boolean starttlsEnable;
    private final String fromAddress;
    private final String senderName;

    public EmailServiceImpl(
            @Autowired(required = false) JavaMailSender mailSender,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${spring.mail.port:587}") int mailPort,
            @Value("${spring.mail.username:}") String mailUsername,
            @Value("${spring.mail.password:}") String mailPassword,
            @Value("${spring.mail.properties.mail.smtp.auth:true}") boolean smtpAuth,
            @Value("${spring.mail.properties.mail.smtp.starttls.enable:true}") boolean starttlsEnable,
            @Value("${app.mail.from:}") String configuredFromAddress,
            @Value("${app.mail.sender-name:CampusNexus}") String senderName
    ) {
        this.mailSender = Optional.ofNullable(mailSender);
        this.mailHost = mailHost != null ? mailHost.trim() : "";
        this.mailPort = mailPort;
        this.mailUsername = mailUsername != null ? mailUsername.trim() : "";
        this.mailPassword = mailPassword != null ? mailPassword.trim() : "";
        this.smtpAuth = smtpAuth;
        this.starttlsEnable = starttlsEnable;
        this.senderName = (senderName != null && !senderName.isBlank()) ? senderName.trim() : "CampusNexus";

        // Determine effective sender address
        if (configuredFromAddress != null && !configuredFromAddress.isBlank() && !configuredFromAddress.contains("no-reply@campusnexus.internal")) {
            this.fromAddress = configuredFromAddress.trim();
        } else if (!this.mailUsername.isBlank()) {
            this.fromAddress = this.mailUsername;
        } else {
            this.fromAddress = "no-reply@campusnexus.internal";
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void logSmtpStartupStatus() {
        boolean hostSet = !mailHost.isBlank();
        boolean portSet = mailPort > 0;
        boolean userSet = !mailUsername.isBlank();
        boolean passSet = !mailPassword.isBlank();

        log.info("=== CampusNexus SMTP Configuration Status ===");
        log.info("SMTP configuration: hostConfigured={}, portConfigured={}, usernameConfigured={}, passwordConfigured={}, starttls={}",
                hostSet, portSet, userSet, passSet, starttlsEnable);
        if (!hostSet || !userSet || !passSet) {
            log.warn("WARNING: SMTP configuration is incomplete. Real email dispatch will be unavailable until environment variables (SPRING_MAIL_HOST, SPRING_MAIL_USERNAME, SPRING_MAIL_PASSWORD) are set.");
        } else {
            log.info("SMTP configuration is active. Ready to dispatch institutional emails via {}:{}", mailHost, mailPort);
        }
        log.info("=============================================");
    }

    @Override
    public void sendVerificationOtp(String toEmail, String fullName, String otp, int validityMinutes) {
        ensureSmtpAvailable(toEmail);

        String recipientName = (fullName != null && !fullName.isBlank()) ? fullName.trim() : "Student";
        JavaMailSender sender = mailSender.orElseThrow(() ->
                new EmailDeliveryException("SMTP provider is not configured.", FailureReason.NOT_CONFIGURED));

        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromAddress, senderName, "UTF-8"));
            helper.setTo(toEmail);
            helper.setSubject("Verify your CampusNexus account");

            String htmlContent = buildVerificationEmailHtml(recipientName, otp, validityMinutes);
            String textContent = buildVerificationEmailText(recipientName, otp, validityMinutes);

            helper.setText(textContent, htmlContent);

            log.info("Preparing EMAIL_VERIFICATION email: recipientDomain={}, messageType=EMAIL_VERIFICATION, smtpConfigured=true", getDomain(toEmail));
            sender.send(message);
            log.info("Email delivery accepted by SMTP server: messageType=EMAIL_VERIFICATION, recipientDomain={}", getDomain(toEmail));
        } catch (Exception e) {
            handleMailException("email verification", toEmail, e);
        }
    }

    @Override
    public void sendVerificationOtp(String toEmail, String otp, int validityMinutes) {
        sendVerificationOtp(toEmail, null, otp, validityMinutes);
    }

    @Override
    public void sendPasswordResetOtp(String toEmail, String fullName, String otp, int validityMinutes) {
        ensureSmtpAvailable(toEmail);

        String recipientName = (fullName != null && !fullName.isBlank()) ? fullName.trim() : "User";
        JavaMailSender sender = mailSender.orElseThrow(() ->
                new EmailDeliveryException("SMTP provider is not configured.", FailureReason.NOT_CONFIGURED));

        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromAddress, senderName, "UTF-8"));
            helper.setTo(toEmail);
            helper.setSubject("Reset your CampusNexus password");

            String htmlContent = buildPasswordResetEmailHtml(recipientName, otp, validityMinutes);
            String textContent = buildPasswordResetEmailText(recipientName, otp, validityMinutes);

            helper.setText(textContent, htmlContent);

            log.info("Preparing PASSWORD_RESET email: recipientDomain={}, messageType=PASSWORD_RESET, smtpConfigured=true", getDomain(toEmail));
            sender.send(message);
            log.info("Email delivery accepted by SMTP server: messageType=PASSWORD_RESET, recipientDomain={}", getDomain(toEmail));
        } catch (Exception e) {
            handleMailException("password reset", toEmail, e);
        }
    }

    @Override
    public void sendPasswordResetOtp(String toEmail, String otp, int validityMinutes) {
        sendPasswordResetOtp(toEmail, null, otp, validityMinutes);
    }

    @Override
    public SmtpStatus getSmtpStatus() {
        boolean configured = mailSender.isPresent() && !mailHost.isBlank();
        String message = configured
                ? "SMTP provider configured on host " + mailHost + ":" + mailPort
                : "SMTP host is not configured.";

        return new SmtpStatus(
                configured,
                mailHost,
                mailPort,
                fromAddress,
                smtpAuth,
                starttlsEnable,
                message
        );
    }

    private void ensureSmtpAvailable(String toEmail) {
        if (mailSender.isEmpty() || mailHost.isBlank()) {
            log.warn("SMTP delivery attempt to {} aborted: JavaMailSender/host is not configured.", maskEmail(toEmail));
            throw new EmailDeliveryException(
                    "SMTP provider is not configured. Email could not be delivered.",
                    FailureReason.NOT_CONFIGURED
            );
        }
    }

    private void handleMailException(String operation, String toEmail, Exception e) {
        String masked = maskEmail(toEmail);

        Throwable root = e;
        while (root.getCause() != null && root.getCause() != root) {
            if (root instanceof AuthenticationFailedException || root instanceof MailAuthenticationException) {
                break;
            }
            if (root instanceof SendFailedException) {
                break;
            }
            if (root instanceof ConnectException || root instanceof UnknownHostException || root instanceof SocketTimeoutException) {
                break;
            }
            root = root.getCause();
        }

        if (e instanceof MailAuthenticationException || e instanceof AuthenticationFailedException || root instanceof AuthenticationFailedException || root instanceof MailAuthenticationException) {
            log.error("SMTP Authentication failure for {} to {}: {}", operation, masked, e.getMessage());
            throw new EmailDeliveryException("SMTP authentication failed.", e, FailureReason.AUTHENTICATION_FAILURE);
        }

        if (e instanceof SendFailedException || root instanceof SendFailedException) {
            log.error("SMTP Recipient rejected for {} to {}: {}", operation, masked, e.getMessage());
            throw new EmailDeliveryException("Recipient email address rejected by SMTP provider.", e, FailureReason.RECIPIENT_REJECTED);
        }

        if (root instanceof ConnectException || root instanceof UnknownHostException || root instanceof SocketTimeoutException) {
            log.error("SMTP Connection error during {} to {}: {}", operation, masked, root.getMessage());
            throw new EmailDeliveryException("SMTP host connection failed.", e, FailureReason.CONNECTION_FAILURE);
        }

        if (e instanceof MailParseException || e instanceof MessagingException) {
            log.error("Message formatting error during {} to {}: {}", operation, masked, e.getMessage());
            throw new EmailDeliveryException("Failed to construct email message.", e, FailureReason.MESSAGE_CONSTRUCTION_ERROR);
        }

        if (e instanceof MailSendException mse) {
            for (Exception subEx : mse.getMessageExceptions()) {
                if (subEx instanceof ConnectException || subEx instanceof UnknownHostException || subEx instanceof SocketTimeoutException) {
                    log.error("SMTP Connection error during {} to {}: {}", operation, masked, subEx.getMessage());
                    throw new EmailDeliveryException("SMTP host connection failed.", e, FailureReason.CONNECTION_FAILURE);
                }
                if (subEx instanceof AuthenticationFailedException || subEx instanceof MailAuthenticationException) {
                    log.error("SMTP Authentication failure during {} to {}: {}", operation, masked, subEx.getMessage());
                    throw new EmailDeliveryException("SMTP authentication failed.", e, FailureReason.AUTHENTICATION_FAILURE);
                }
                if (subEx instanceof SendFailedException) {
                    log.error("SMTP Send failure during {} to {}: {}", operation, masked, subEx.getMessage());
                    throw new EmailDeliveryException("Recipient address rejected by SMTP server.", e, FailureReason.RECIPIENT_REJECTED);
                }
            }
            log.error("SMTP MailSendException during {} to {}: {}", operation, masked, mse.getMessage());
            throw new EmailDeliveryException("Mail transport error occurred.", e, FailureReason.TRANSPORT_ERROR);
        }

        if (e instanceof MailException) {
            log.error("Spring MailException during {} to {}: {}", operation, masked, e.getMessage());
            throw new EmailDeliveryException("Mail delivery failed.", e, FailureReason.TRANSPORT_ERROR);
        }

        log.error("Unexpected error during {} email delivery to {}: {}", operation, masked, e.getMessage());
        throw new EmailDeliveryException("Failed to dispatch email.", e, FailureReason.TRANSPORT_ERROR);
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        int atIndex = email.indexOf("@");
        String prefix = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        if (prefix.length() <= 3) {
            return prefix.charAt(0) + "***" + domain;
        }
        return prefix.substring(0, 2) + "***" + prefix.substring(prefix.length() - 1) + domain;
    }

    private String getDomain(String email) {
        if (email == null || !email.contains("@")) return "unknown";
        return email.substring(email.indexOf("@") + 1);
    }

    private String buildVerificationEmailHtml(String fullName, String otp, int validityMinutes) {
        String name = (fullName != null && !fullName.isBlank()) ? fullName : "Student";
        String code = otp != null ? otp : "";
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset=\"utf-8\">\n" +
                "    <style>\n" +
                "        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }\n" +
                "        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }\n" +
                "        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; padding: 28px; text-align: center; }\n" +
                "        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }\n" +
                "        .header p { margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; }\n" +
                "        .content { padding: 28px; }\n" +
                "        .greeting { font-size: 16px; margin-bottom: 16px; color: #334155; font-weight: 500; }\n" +
                "        .instruction { font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 20px; }\n" +
                "        .otp-container { text-align: center; margin: 28px 0; }\n" +
                "        .otp-code { display: inline-block; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #4f46e5; background: #f1f5f9; padding: 14px 28px; border-radius: 8px; border: 1px dashed #cbd5e1; }\n" +
                "        .expiry-note { font-size: 14px; color: #64748b; text-align: center; margin-top: 12px; }\n" +
                "        .security-warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; font-size: 13px; color: #b45309; border-radius: 4px; margin-top: 24px; }\n" +
                "        .footer { border-top: 1px solid #f1f5f9; padding: 20px 28px; font-size: 12px; color: #94a3b8; text-align: center; background: #f8fafc; }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"container\">\n" +
                "        <div class=\"header\">\n" +
                "            <h1>CampusNexus</h1>\n" +
                "            <p>Email Verification</p>\n" +
                "        </div>\n" +
                "        <div class=\"content\">\n" +
                "            <p class=\"greeting\">Hello " + name + ",</p>\n" +
                "            <p class=\"instruction\">Your CampusNexus verification code is:</p>\n" +
                "            <div class=\"otp-container\">\n" +
                "                <div class=\"otp-code\">" + code + "</div>\n" +
                "                <p class=\"expiry-note\">This code expires in <strong>" + validityMinutes + " minutes</strong>.</p>\n" +
                "            </div>\n" +
                "            <div class=\"security-warning\">\n" +
                "                If you did not create a CampusNexus account, you can ignore this email.\n" +
                "            </div>\n" +
                "        </div>\n" +
                "        <div class=\"footer\">\n" +
                "            <strong>CampusNexus</strong><br>\n" +
                "            MLR Institute of Technology\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
    }

    private String buildVerificationEmailText(String fullName, String otp, int validityMinutes) {
        String name = (fullName != null && !fullName.isBlank()) ? fullName : "Student";
        String code = otp != null ? otp : "";
        return "CampusNexus\n" +
                "Email Verification\n\n" +
                "Hello " + name + ",\n\n" +
                "Your CampusNexus verification code is:\n\n" +
                code + "\n\n" +
                "This code expires in " + validityMinutes + " minutes.\n\n" +
                "If you did not create a CampusNexus account, you can ignore this email.\n\n" +
                "CampusNexus\n" +
                "MLR Institute of Technology\n";
    }

    private String buildPasswordResetEmailHtml(String fullName, String otp, int validityMinutes) {
        String name = (fullName != null && !fullName.isBlank()) ? fullName : "User";
        String code = otp != null ? otp : "";
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset=\"utf-8\">\n" +
                "    <style>\n" +
                "        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }\n" +
                "        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }\n" +
                "        .header { background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: #ffffff; padding: 28px; text-align: center; }\n" +
                "        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }\n" +
                "        .header p { margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; }\n" +
                "        .content { padding: 28px; }\n" +
                "        .greeting { font-size: 16px; margin-bottom: 16px; color: #334155; font-weight: 500; }\n" +
                "        .instruction { font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 20px; }\n" +
                "        .otp-container { text-align: center; margin: 28px 0; }\n" +
                "        .otp-code { display: inline-block; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ef4444; background: #fef2f2; padding: 14px 28px; border-radius: 8px; border: 1px dashed #fca5a5; }\n" +
                "        .expiry-note { font-size: 14px; color: #64748b; text-align: center; margin-top: 12px; }\n" +
                "        .security-warning { background: #fff1f2; border-left: 4px solid #ef4444; padding: 12px 16px; font-size: 13px; color: #9f1239; border-radius: 4px; margin-top: 24px; }\n" +
                "        .footer { border-top: 1px solid #f1f5f9; padding: 20px 28px; font-size: 12px; color: #94a3b8; text-align: center; background: #f8fafc; }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"container\">\n" +
                "        <div class=\"header\">\n" +
                "            <h1>CampusNexus Security</h1>\n" +
                "            <p>Password Reset</p>\n" +
                "        </div>\n" +
                "        <div class=\"content\">\n" +
                "            <p class=\"greeting\">Hello " + name + ",</p>\n" +
                "            <p class=\"instruction\">A request was received to reset your password. Use the verification code below to authorize your password reset:</p>\n" +
                "            <div class=\"otp-container\">\n" +
                "                <div class=\"otp-code\">" + code + "</div>\n" +
                "                <p class=\"expiry-note\">This code expires in <strong>" + validityMinutes + " minutes</strong>.</p>\n" +
                "            </div>\n" +
                "            <div class=\"security-warning\">\n" +
                "                <strong>Security Notice:</strong> If you did not request a password reset, you can safely ignore this email. Never share this code with anyone.\n" +
                "            </div>\n" +
                "        </div>\n" +
                "        <div class=\"footer\">\n" +
                "            <strong>CampusNexus</strong><br>\n" +
                "            MLR Institute of Technology\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
    }

    private String buildPasswordResetEmailText(String fullName, String otp, int validityMinutes) {
        String name = (fullName != null && !fullName.isBlank()) ? fullName : "User";
        String code = otp != null ? otp : "";
        return "CampusNexus Security\n" +
                "Password Reset\n\n" +
                "Hello " + name + ",\n\n" +
                "A request was received to reset your password. Use the verification code below to authorize your password reset:\n\n" +
                code + "\n\n" +
                "This code expires in " + validityMinutes + " minutes.\n\n" +
                "If you did not request a password reset, you can safely ignore this email.\n\n" +
                "CampusNexus\n" +
                "MLR Institute of Technology\n";
    }
}
