package com.campusnexus.security;

import com.campusnexus.entity.Department;
import com.campusnexus.entity.User;
import com.campusnexus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service("authorizationService")
public class AuthorizationService {

    private static final Logger log = LoggerFactory.getLogger(AuthorizationService.class);

    private final UserRepository userRepository;

    public AuthorizationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ==========================================
    // Entity-based Helper Methods
    // ==========================================

    public boolean isStudent(User user) {
        return user != null && user.isEnabled() && user.isStudent();
    }

    public boolean isModerator(User user) {
        return user != null && user.isEnabled() && user.isModerator();
    }

    public boolean isAdmin(User user) {
        return user != null && user.isEnabled() && user.isAdmin();
    }

    public boolean isStudentCoordinator(User user) {
        return user != null && user.isEnabled() && user.isStudentCoordinator();
    }

    public boolean isCoordinatorForDepartment(User user, Long departmentId) {
        if (!isStudentCoordinator(user) || departmentId == null) {
            return false;
        }
        return user.getCoordinatorDepartment() != null
                && user.getCoordinatorDepartment().getId() != null
                && user.getCoordinatorDepartment().getId().equals(departmentId);
    }

    public boolean isCoordinatorForDepartment(User user, String departmentCode) {
        if (!isStudentCoordinator(user) || departmentCode == null || departmentCode.isBlank()) {
            return false;
        }
        return user.getCoordinatorDepartment() != null
                && user.getCoordinatorDepartment().getCode() != null
                && departmentCode.trim().equalsIgnoreCase(user.getCoordinatorDepartment().getCode());
    }

    public boolean isInUserDepartment(User user, Long departmentId) {
        if (!isStudent(user) || user.getDepartment() == null || departmentId == null) {
            return false;
        }
        return user.getDepartment().getId() != null
                && user.getDepartment().getId().equals(departmentId);
    }

    public boolean isInUserDepartment(User user, String departmentCode) {
        if (!isStudent(user) || user.getDepartment() == null || departmentCode == null || departmentCode.isBlank()) {
            return false;
        }
        return user.getDepartment().getCode() != null
                && departmentCode.trim().equalsIgnoreCase(user.getDepartment().getCode());
    }

    public boolean isInUserDepartment(User user, Department department) {
        if (department == null || department.getId() == null) {
            return false;
        }
        return isInUserDepartment(user, department.getId());
    }

    // ==========================================
    // Authentication-based Evaluators (for SpEL / Security Context)
    // ==========================================

    @Transactional(readOnly = true)
    public boolean isStudent(Authentication authentication) {
        return resolveUser(authentication)
                .map(this::isStudent)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean isModerator(Authentication authentication) {
        return resolveUser(authentication)
                .map(this::isModerator)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean isAdmin(Authentication authentication) {
        return resolveUser(authentication)
                .map(this::isAdmin)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean isStudentCoordinator(Authentication authentication) {
        return resolveUser(authentication)
                .map(this::isStudentCoordinator)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean isCoordinatorForDepartment(Authentication authentication, Long departmentId) {
        if (departmentId == null) {
            return false;
        }
        return resolveUser(authentication)
                .map(user -> isCoordinatorForDepartment(user, departmentId))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean isCoordinatorForDepartment(Authentication authentication, String departmentCode) {
        if (departmentCode == null || departmentCode.isBlank()) {
            return false;
        }
        return resolveUser(authentication)
                .map(user -> isCoordinatorForDepartment(user, departmentCode))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean isInUserDepartment(Authentication authentication, Long departmentId) {
        if (departmentId == null) {
            return false;
        }
        return resolveUser(authentication)
                .map(user -> isInUserDepartment(user, departmentId))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean isInUserDepartment(Authentication authentication, String departmentCode) {
        if (departmentCode == null || departmentCode.isBlank()) {
            return false;
        }
        return resolveUser(authentication)
                .map(user -> isInUserDepartment(user, departmentCode))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean isInUserDepartment(Authentication authentication, Department department) {
        if (department == null || department.getId() == null) {
            return false;
        }
        return isInUserDepartment(authentication, department.getId());
    }

    // ==========================================
    // Internal User Resolution
    // ==========================================

    @Transactional(readOnly = true)
    public Optional<User> resolveAuthenticatedUser(Authentication authentication) {
        return resolveUser(authentication);
    }

    private Optional<User> resolveUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }

        String email = null;
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        } else if (principal instanceof String principalString && !principalString.isBlank() && !"anonymousUser".equalsIgnoreCase(principalString)) {
            email = principalString;
        }

        if (email == null || email.isBlank()) {
            return Optional.empty();
        }

        try {
            return userRepository.findByEmail(email)
                    .filter(User::isEnabled);
        } catch (Exception ex) {
            log.warn("Error resolving authenticated user for authorization check: {}", ex.getMessage());
            return Optional.empty();
        }
    }
}
