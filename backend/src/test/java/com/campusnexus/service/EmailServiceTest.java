package com.campusnexus.service;

import com.campusnexus.exception.EmailDeliveryException;
import com.campusnexus.exception.EmailDeliveryException.FailureReason;
import jakarta.mail.SendFailedException;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import java.net.ConnectException;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailServiceImpl emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailServiceImpl(
                mailSender,
                "smtp.gmail.com",
                587,
                "campusnexus.auth@mlrit.ac.in",
                "test-mail-password",
                true,
                true,
                "campusnexus.auth@mlrit.ac.in",
                "CampusNexus"
        );
    }

    @Test
    @DisplayName("sendVerificationOtp dispatches formatted MimeMessage to institutional email")
    void testSendVerificationOtpSuccess() {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendVerificationOtp("23r21a0501@mlrit.ac.in", "John Doe", "123456", 3);

        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("sendPasswordResetOtp dispatches formatted MimeMessage to institutional email")
    void testSendPasswordResetOtpSuccess() {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendPasswordResetOtp("student@mlrit.ac.in", "Jane Doe", "654321", 10);

        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("sendVerificationOtp throws NOT_CONFIGURED when JavaMailSender is absent or host is empty")
    void testSendVerificationOtpUnconfigured() {
        EmailServiceImpl unconfiguredService = new EmailServiceImpl(
                null,
                "",
                587,
                "",
                "",
                true,
                true,
                "",
                "CampusNexus"
        );

        assertThatThrownBy(() -> unconfiguredService.sendVerificationOtp("23r21a0501@mlrit.ac.in", "John Doe", "123456", 3))
                .isInstanceOf(EmailDeliveryException.class)
                .satisfies(ex -> assertThat(((EmailDeliveryException) ex).getReason()).isEqualTo(FailureReason.NOT_CONFIGURED));
    }

    @Test
    @DisplayName("sendVerificationOtp maps AuthenticationFailedException to AUTHENTICATION_FAILURE")
    void testSendVerificationOtpAuthFailure() {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new MailAuthenticationException("Invalid SMTP credentials")).when(mailSender).send(any(MimeMessage.class));

        assertThatThrownBy(() -> emailService.sendVerificationOtp("23r21a0501@mlrit.ac.in", "John Doe", "123456", 3))
                .isInstanceOf(EmailDeliveryException.class)
                .satisfies(ex -> assertThat(((EmailDeliveryException) ex).getReason()).isEqualTo(FailureReason.AUTHENTICATION_FAILURE));
    }

    @Test
    @DisplayName("sendVerificationOtp maps SendFailedException to RECIPIENT_REJECTED")
    void testSendVerificationOtpRecipientRejected() {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        MailSendException sendEx = new MailSendException("Failed", new SendFailedException("Invalid address"));
        doThrow(sendEx).when(mailSender).send(any(MimeMessage.class));

        assertThatThrownBy(() -> emailService.sendVerificationOtp("invalid@domain.com", "John Doe", "123456", 3))
                .isInstanceOf(EmailDeliveryException.class)
                .satisfies(ex -> assertThat(((EmailDeliveryException) ex).getReason()).isEqualTo(FailureReason.RECIPIENT_REJECTED));
    }

    @Test
    @DisplayName("sendVerificationOtp maps ConnectException to CONNECTION_FAILURE")
    void testSendVerificationOtpConnectionFailure() {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        MailSendException sendEx = new MailSendException("Failed", new ConnectException("Connection refused"));
        doThrow(sendEx).when(mailSender).send(any(MimeMessage.class));

        assertThatThrownBy(() -> emailService.sendVerificationOtp("23r21a0501@mlrit.ac.in", "John Doe", "123456", 3))
                .isInstanceOf(EmailDeliveryException.class)
                .satisfies(ex -> assertThat(((EmailDeliveryException) ex).getReason()).isEqualTo(FailureReason.CONNECTION_FAILURE));
    }

    @Test
    @DisplayName("getSmtpStatus returns configured status without exposing credentials")
    void testGetSmtpStatus() {
        EmailService.SmtpStatus status = emailService.getSmtpStatus();

        assertThat(status.configured()).isTrue();
        assertThat(status.host()).isEqualTo("smtp.gmail.com");
        assertThat(status.port()).isEqualTo(587);
        assertThat(status.fromAddress()).isEqualTo("campusnexus.auth@mlrit.ac.in");
        assertThat(status.authEnabled()).isTrue();
        assertThat(status.starttlsEnabled()).isTrue();
        assertThat(status.statusMessage()).contains("smtp.gmail.com:587");
    }
}
