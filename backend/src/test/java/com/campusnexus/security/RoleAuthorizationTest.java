package com.campusnexus.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.stereotype.Service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Import(RoleAuthorizationTest.TestServiceConfiguration.class)
class RoleAuthorizationTest {

    @TestConfiguration
    static class TestServiceConfiguration {
        @Bean
        public SecuredTestService securedTestService() {
            return new SecuredTestService();
        }
    }

    @Service
    static class SecuredTestService {

        @PreAuthorize("hasRole('STUDENT')")
        public String studentAction() {
            return "STUDENT_GRANTED";
        }

        @PreAuthorize("hasRole('MODERATOR')")
        public String moderatorAction() {
            return "MODERATOR_GRANTED";
        }

        @PreAuthorize("hasRole('ADMIN')")
        public String adminAction() {
            return "ADMIN_GRANTED";
        }
    }

    @Autowired
    private SecuredTestService securedTestService;

    @Test
    @DisplayName("Unauthenticated call to secured method should fail")
    void shouldRejectUnauthenticatedAccess() {
        assertThatThrownBy(() -> securedTestService.studentAction())
                .isInstanceOf(AuthenticationCredentialsNotFoundException.class);
    }

    @Test
    @WithMockUser(username = "student@campusnexus.com", roles = {"STUDENT"})
    @DisplayName("STUDENT role can access student-secured method but is rejected from ADMIN and MODERATOR methods")
    void shouldAuthorizeStudentCorrectly() {
        assertThat(securedTestService.studentAction()).isEqualTo("STUDENT_GRANTED");

        assertThatThrownBy(() -> securedTestService.adminAction())
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> securedTestService.moderatorAction())
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @WithMockUser(username = "moderator@campusnexus.com", roles = {"MODERATOR"})
    @DisplayName("MODERATOR role can access moderator-secured method but is rejected from ADMIN methods")
    void shouldAuthorizeModeratorCorrectly() {
        assertThat(securedTestService.moderatorAction()).isEqualTo("MODERATOR_GRANTED");

        assertThatThrownBy(() -> securedTestService.adminAction())
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> securedTestService.studentAction())
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @WithMockUser(username = "admin@campusnexus.com", roles = {"ADMIN"})
    @DisplayName("ADMIN role can access admin-secured method")
    void shouldAuthorizeAdminCorrectly() {
        assertThat(securedTestService.adminAction()).isEqualTo("ADMIN_GRANTED");
    }
}
