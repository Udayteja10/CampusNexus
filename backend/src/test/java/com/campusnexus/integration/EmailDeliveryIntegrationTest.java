package com.campusnexus.integration;

import com.campusnexus.service.EmailService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

@SpringBootTest
class EmailDeliveryIntegrationTest {

    private static final Logger log = LoggerFactory.getLogger(EmailDeliveryIntegrationTest.class);

    @Autowired
    private EmailService emailService;

    @Test
    @DisplayName("Live SMTP Delivery Test (Only executed when CAMPUSNEXUS_EMAIL_LIVE_TEST=true)")
    @EnabledIfEnvironmentVariable(named = "CAMPUSNEXUS_EMAIL_LIVE_TEST", matches = "true")
    void testLiveSmtpDelivery() {
        String testRecipient = System.getenv().getOrDefault("CAMPUSNEXUS_LIVE_TEST_EMAIL", "23r21a0501@mlrit.ac.in");
        String dummyOtp = "987654"; // Dummy OTP for live delivery validation

        log.info("Starting live SMTP delivery test to configured recipient...");

        EmailService.SmtpStatus status = emailService.getSmtpStatus();
        assertThat(status.configured()).isTrue();

        assertThatCode(() -> emailService.sendVerificationOtp(testRecipient, "Live Test Student", dummyOtp, 3))
                .doesNotThrowAnyException();

        log.info("Live SMTP delivery test completed successfully. Email accepted by SMTP gateway.");
    }
}
