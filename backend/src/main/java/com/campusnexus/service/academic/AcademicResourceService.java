package com.campusnexus.service.academic;

import com.campusnexus.dto.academic.AcademicResourceDto;
import com.campusnexus.entity.Department;
import com.campusnexus.entity.User;
import com.campusnexus.entity.academic.AcademicResource;
import com.campusnexus.entity.academic.ResourceType;
import com.campusnexus.entity.academic.Subject;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.academic.AcademicResourceRepository;
import com.campusnexus.repository.academic.SubjectRepository;
import com.campusnexus.security.AuthorizationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class AcademicResourceService {

    private final AcademicResourceRepository resourceRepository;
    private final SubjectRepository subjectRepository;
    private final DepartmentRepository departmentRepository;
    private final AuthorizationService authorizationService;

    public AcademicResourceService(AcademicResourceRepository resourceRepository,
                                   SubjectRepository subjectRepository,
                                   DepartmentRepository departmentRepository,
                                   AuthorizationService authorizationService) {
        this.resourceRepository = resourceRepository;
        this.subjectRepository = subjectRepository;
        this.departmentRepository = departmentRepository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public List<AcademicResourceDto> getResources(Authentication authentication, Long requestedDepartmentId, Integer semester, ResourceType resourceType) {
        User user = resolveUser(authentication);

        if (user.isStudent()) {
            Department dept = requireStudentDepartment(user);
            List<AcademicResource> resources = (semester != null)
                    ? resourceRepository.findAllByDepartmentIdAndSemester(dept.getId(), semester)
                    : (resourceType != null)
                    ? resourceRepository.findAllByDepartmentIdAndResourceType(dept.getId(), resourceType)
                    : resourceRepository.findAllByDepartmentId(dept.getId());

            return resources.stream().map(AcademicResourceDto::fromEntity).collect(Collectors.toList());
        }

        // Moderator or Admin
        if (requestedDepartmentId != null) {
            List<AcademicResource> resources = (semester != null)
                    ? resourceRepository.findAllByDepartmentIdAndSemester(requestedDepartmentId, semester)
                    : (resourceType != null)
                    ? resourceRepository.findAllByDepartmentIdAndResourceType(requestedDepartmentId, resourceType)
                    : resourceRepository.findAllByDepartmentId(requestedDepartmentId);

            return resources.stream().map(AcademicResourceDto::fromEntity).collect(Collectors.toList());
        }

        return resourceRepository.findAll().stream()
                .filter(r -> semester == null || r.getSemester().equals(semester))
                .filter(r -> resourceType == null || r.getResourceType() == resourceType)
                .map(AcademicResourceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AcademicResourceDto getResourceById(Authentication authentication, Long id) {
        User user = resolveUser(authentication);
        AcademicResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic resource not found with id: " + id));

        if (user.isStudent()) {
            Department studentDept = requireStudentDepartment(user);
            if (!resource.getDepartment().getId().equals(studentDept.getId())) {
                throw new AccessDeniedException("Access denied: Academic resource belongs to another department.");
            }
        }

        return AcademicResourceDto.fromEntity(resource);
    }

    @Transactional
    public AcademicResourceDto createResource(Authentication authentication, AcademicResourceDto.CreateRequest request) {
        User user = resolveUser(authentication);

        Department targetDept;
        if (user.isStudent()) {
            targetDept = requireStudentDepartment(user);
            if (request.getDepartmentId() != null && !request.getDepartmentId().equals(targetDept.getId())) {
                throw new AccessDeniedException("Access denied: Cannot upload resources for another department.");
            }
        } else {
            if (request.getDepartmentId() == null) {
                throw new IllegalArgumentException("Department ID is required for administrative upload.");
            }
            targetDept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
        }

        Subject subject = null;
        if (request.getSubjectId() != null) {
            subject = subjectRepository.findByIdAndDepartmentId(request.getSubjectId(), targetDept.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found in department " + targetDept.getCode() + " with id: " + request.getSubjectId()));
        }

        AcademicResource resource = new AcademicResource(
                request.getTitle().trim(),
                request.getDescription(),
                targetDept,
                subject,
                request.getSubjectCode(),
                request.getSubjectName(),
                request.getSemester(),
                request.getResourceType(),
                request.getFileUrl(),
                request.getFileType(),
                request.getFileSize(),
                user
        );

        AcademicResource saved = resourceRepository.save(resource);
        return AcademicResourceDto.fromEntity(saved);
    }

    @Transactional
    public void deleteResource(Authentication authentication, Long id) {
        User user = resolveUser(authentication);
        AcademicResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic resource not found with id: " + id));

        if (user.isAdmin() || user.isModerator()) {
            resourceRepository.delete(resource);
            return;
        }

        Department studentDept = requireStudentDepartment(user);
        if (!resource.getDepartment().getId().equals(studentDept.getId())) {
            throw new AccessDeniedException("Access denied: Resource belongs to another department.");
        }

        boolean isUploader = resource.getUploader() != null && Objects.equals(resource.getUploader().getId(), user.getId());
        boolean isDeptCoordinator = user.isStudentCoordinator() && authorizationService.isCoordinatorForDepartment(user, studentDept.getId());

        if (!isUploader && !isDeptCoordinator) {
            throw new AccessDeniedException("Access denied: Only the uploader, department coordinator, or moderators can delete this resource.");
        }

        resourceRepository.delete(resource);
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
