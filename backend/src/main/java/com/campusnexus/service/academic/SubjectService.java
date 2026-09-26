package com.campusnexus.service.academic;

import com.campusnexus.dto.academic.SubjectDto;
import com.campusnexus.entity.Department;
import com.campusnexus.entity.User;
import com.campusnexus.entity.academic.Subject;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.academic.SubjectRepository;
import com.campusnexus.security.AuthorizationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final DepartmentRepository departmentRepository;
    private final AuthorizationService authorizationService;

    public SubjectService(SubjectRepository subjectRepository,
                          DepartmentRepository departmentRepository,
                          AuthorizationService authorizationService) {
        this.subjectRepository = subjectRepository;
        this.departmentRepository = departmentRepository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public List<SubjectDto> getSubjects(Authentication authentication, Long requestedDepartmentId, Integer semester) {
        User user = resolveUser(authentication);

        if (user.isStudent()) {
            Department dept = requireStudentDepartment(user);
            List<Subject> subjects = (semester != null)
                    ? subjectRepository.findAllByDepartmentIdAndSemester(dept.getId(), semester)
                    : subjectRepository.findAllByDepartmentId(dept.getId());
            return subjects.stream().map(SubjectDto::fromEntity).collect(Collectors.toList());
        }

        // Moderator or Admin
        if (requestedDepartmentId != null) {
            List<Subject> subjects = (semester != null)
                    ? subjectRepository.findAllByDepartmentIdAndSemester(requestedDepartmentId, semester)
                    : subjectRepository.findAllByDepartmentId(requestedDepartmentId);
            return subjects.stream().map(SubjectDto::fromEntity).collect(Collectors.toList());
        }

        return subjectRepository.findAll().stream()
                .filter(s -> semester == null || s.getSemester().equals(semester))
                .map(SubjectDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubjectDto getSubjectById(Authentication authentication, Long id) {
        User user = resolveUser(authentication);
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));

        if (user.isStudent()) {
            Department studentDept = requireStudentDepartment(user);
            if (!subject.getDepartment().getId().equals(studentDept.getId())) {
                throw new AccessDeniedException("Access denied: Subject belongs to another department.");
            }
        }

        return SubjectDto.fromEntity(subject);
    }

    @Transactional
    public SubjectDto createSubject(Authentication authentication, SubjectDto.CreateRequest request) {
        User user = resolveUser(authentication);

        Department targetDept;
        if (user.isAdmin()) {
            if (request.getDepartmentId() == null) {
                throw new IllegalArgumentException("Department ID is required for admin subject creation.");
            }
            targetDept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
        } else if (user.isStudentCoordinator()) {
            targetDept = requireStudentDepartment(user);
            if (!authorizationService.isCoordinatorForDepartment(user, targetDept.getId())) {
                throw new AccessDeniedException("Access denied: You are not a coordinator for department: " + targetDept.getCode());
            }
        } else {
            throw new AccessDeniedException("Access denied: Only administrators and department coordinators can create subjects.");
        }

        if (subjectRepository.existsByDepartmentIdAndCode(targetDept.getId(), request.getCode().trim().toUpperCase())) {
            throw new IllegalArgumentException("Subject code already exists in this department: " + request.getCode());
        }

        Subject subject = new Subject(
                request.getCode().trim().toUpperCase(),
                request.getName().trim(),
                targetDept,
                request.getSemester(),
                request.getCredits(),
                request.getDescription()
        );

        Subject saved = subjectRepository.save(subject);
        return SubjectDto.fromEntity(saved);
    }

    @Transactional
    public void deleteSubject(Authentication authentication, Long id) {
        User user = resolveUser(authentication);
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));

        if (user.isAdmin()) {
            subjectRepository.delete(subject);
            return;
        }

        if (user.isStudentCoordinator() && authorizationService.isCoordinatorForDepartment(user, subject.getDepartment().getId())) {
            subjectRepository.delete(subject);
            return;
        }

        throw new AccessDeniedException("Access denied: Only admins and department coordinators can delete subjects.");
    }

    private User resolveUser(Authentication authentication) {
        return authorizationService.resolveAuthenticatedUser(authentication)
                .orElseThrow(() -> new AccessDeniedException("Unauthenticated or invalid user."));
    }

    private Department requireStudentDepartment(User user) {
        if (user.getDepartment() == null) {
            throw new AccessDeniedException("Access denied: Student does not belong to any department.");
        }
        return user.getDepartment();
    }
}
