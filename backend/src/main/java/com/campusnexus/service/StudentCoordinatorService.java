package com.campusnexus.service;

import com.campusnexus.dto.UserDto;
import com.campusnexus.entity.Department;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class StudentCoordinatorService {

    private static final Logger log = LoggerFactory.getLogger(StudentCoordinatorService.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public StudentCoordinatorService(UserRepository userRepository, DepartmentRepository departmentRepository) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto assignCoordinator(Long userId, Long departmentId) {
        log.debug("Assigning student coordinator permission: userId={}, departmentId={}", userId, departmentId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));

        if (user.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("Only users with role STUDENT can be assigned as student coordinators.");
        }

        if (user.getDepartment() == null) {
            throw new IllegalArgumentException("Target student must have an assigned academic department before becoming a coordinator.");
        }

        if (!user.getDepartment().getId().equals(department.getId())) {
            throw new IllegalArgumentException(String.format(
                    "A student can only coordinate their own academic department (%s).",
                    user.getDepartment().getCode()
            ));
        }

        // Check if department already has another coordinator
        Optional<User> existingCoordinator = userRepository.findByCoordinatorDepartmentId(departmentId);
        if (existingCoordinator.isPresent() && !existingCoordinator.get().getId().equals(userId)) {
            throw new IllegalArgumentException(String.format(
                    "Department %s already has an assigned student coordinator.",
                    department.getCode()
            ));
        }

        user.setCoordinatorDepartment(department);

        try {
            User saved = userRepository.saveAndFlush(user);
            log.info("Student {} successfully assigned as coordinator for department {}", user.getEmail(), department.getCode());
            return UserDto.fromEntity(saved);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Database unique constraint violation on coordinator assignment: {}", ex.getMessage());
            throw new IllegalArgumentException(String.format(
                    "Department %s already has an assigned student coordinator.",
                    department.getCode()
            ));
        }
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto removeCoordinator(Long userId) {
        log.debug("Removing student coordinator permission: userId={}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setCoordinatorDepartment(null);
        User saved = userRepository.save(user);

        log.info("Student coordinator permission removed for user {}", user.getEmail());
        return UserDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public Optional<UserDto> getCoordinatorByDepartmentId(Long departmentId) {
        return userRepository.findByCoordinatorDepartmentId(departmentId)
                .map(UserDto::fromEntity);
    }
}
