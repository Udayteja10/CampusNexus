package com.campusnexus.service.academic;

import com.campusnexus.dto.academic.StudyGroupDto;
import com.campusnexus.entity.Department;
import com.campusnexus.entity.User;
import com.campusnexus.entity.academic.StudyGroup;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.academic.StudyGroupRepository;
import com.campusnexus.security.AuthorizationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class StudyGroupService {

    private final StudyGroupRepository studyGroupRepository;
    private final DepartmentRepository departmentRepository;
    private final AuthorizationService authorizationService;

    public StudyGroupService(StudyGroupRepository studyGroupRepository,
                             DepartmentRepository departmentRepository,
                             AuthorizationService authorizationService) {
        this.studyGroupRepository = studyGroupRepository;
        this.departmentRepository = departmentRepository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public List<StudyGroupDto> getStudyGroups(Authentication authentication, Long requestedDepartmentId, Integer semester) {
        User user = resolveUser(authentication);

        if (user.isStudent()) {
            Department dept = requireStudentDepartment(user);
            List<StudyGroup> groups = (semester != null)
                    ? studyGroupRepository.findAllByDepartmentIdAndSemester(dept.getId(), semester)
                    : studyGroupRepository.findAllByDepartmentId(dept.getId());
            return groups.stream().map(StudyGroupDto::fromEntity).collect(Collectors.toList());
        }

        // Moderator or Admin
        if (requestedDepartmentId != null) {
            List<StudyGroup> groups = (semester != null)
                    ? studyGroupRepository.findAllByDepartmentIdAndSemester(requestedDepartmentId, semester)
                    : studyGroupRepository.findAllByDepartmentId(requestedDepartmentId);
            return groups.stream().map(StudyGroupDto::fromEntity).collect(Collectors.toList());
        }

        return studyGroupRepository.findAll().stream()
                .filter(g -> semester == null || g.getSemester().equals(semester))
                .map(StudyGroupDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudyGroupDto getStudyGroupById(Authentication authentication, Long id) {
        User user = resolveUser(authentication);
        StudyGroup group = studyGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Study group not found with id: " + id));

        if (user.isStudent()) {
            Department studentDept = requireStudentDepartment(user);
            if (!group.getDepartment().getId().equals(studentDept.getId())) {
                throw new AccessDeniedException("Access denied: Study group belongs to another department.");
            }
        }

        return StudyGroupDto.fromEntity(group);
    }

    @Transactional
    public StudyGroupDto createStudyGroup(Authentication authentication, StudyGroupDto.CreateRequest request) {
        User user = resolveUser(authentication);

        Department targetDept;
        if (user.isStudent()) {
            targetDept = requireStudentDepartment(user);
            if (request.getDepartmentId() != null && !request.getDepartmentId().equals(targetDept.getId())) {
                throw new AccessDeniedException("Access denied: Cannot create study group for another department.");
            }
        } else {
            if (request.getDepartmentId() == null) {
                throw new IllegalArgumentException("Department ID is required for administrative study group creation.");
            }
            targetDept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
        }

        StudyGroup group = new StudyGroup(
                request.getName().trim(),
                request.getDescription(),
                targetDept,
                request.getSubjectCode(),
                request.getSubjectName(),
                request.getSemester(),
                user,
                request.getMaxMembers(),
                request.isPrivate(),
                request.getMeetingSchedule()
        );

        StudyGroup saved = studyGroupRepository.save(group);
        return StudyGroupDto.fromEntity(saved);
    }

    @Transactional
    public void deleteStudyGroup(Authentication authentication, Long id) {
        User user = resolveUser(authentication);
        StudyGroup group = studyGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Study group not found with id: " + id));

        if (user.isAdmin() || user.isModerator()) {
            studyGroupRepository.delete(group);
            return;
        }

        Department studentDept = requireStudentDepartment(user);
        if (!group.getDepartment().getId().equals(studentDept.getId())) {
            throw new AccessDeniedException("Access denied: Study group belongs to another department.");
        }

        boolean isLeader = group.getLeader() != null && Objects.equals(group.getLeader().getId(), user.getId());
        boolean isDeptCoordinator = user.isStudentCoordinator() && authorizationService.isCoordinatorForDepartment(user, studentDept.getId());

        if (!isLeader && !isDeptCoordinator) {
            throw new AccessDeniedException("Access denied: Only group leader, coordinator, or moderator can delete this study group.");
        }

        studyGroupRepository.delete(group);
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
