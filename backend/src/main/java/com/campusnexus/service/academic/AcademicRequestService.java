package com.campusnexus.service.academic;

import com.campusnexus.dto.academic.AcademicRequestDto;
import com.campusnexus.entity.Department;
import com.campusnexus.entity.User;
import com.campusnexus.entity.academic.AcademicRequest;
import com.campusnexus.entity.academic.RequestStatus;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.academic.AcademicRequestRepository;
import com.campusnexus.security.AuthorizationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class AcademicRequestService {

    private final AcademicRequestRepository requestRepository;
    private final DepartmentRepository departmentRepository;
    private final AuthorizationService authorizationService;

    public AcademicRequestService(AcademicRequestRepository requestRepository,
                                  DepartmentRepository departmentRepository,
                                  AuthorizationService authorizationService) {
        this.requestRepository = requestRepository;
        this.departmentRepository = departmentRepository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public List<AcademicRequestDto> getRequests(Authentication authentication, Long requestedDepartmentId, RequestStatus status) {
        User user = resolveUser(authentication);

        if (user.isStudent()) {
            Department dept = requireStudentDepartment(user);
            List<AcademicRequest> requests = (status != null)
                    ? requestRepository.findAllByDepartmentIdAndStatus(dept.getId(), status)
                    : requestRepository.findAllByDepartmentId(dept.getId());
            return requests.stream().map(AcademicRequestDto::fromEntity).collect(Collectors.toList());
        }

        // Moderator or Admin
        if (requestedDepartmentId != null) {
            List<AcademicRequest> requests = (status != null)
                    ? requestRepository.findAllByDepartmentIdAndStatus(requestedDepartmentId, status)
                    : requestRepository.findAllByDepartmentId(requestedDepartmentId);
            return requests.stream().map(AcademicRequestDto::fromEntity).collect(Collectors.toList());
        }

        return requestRepository.findAll().stream()
                .filter(r -> status == null || r.getStatus() == status)
                .map(AcademicRequestDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AcademicRequestDto getRequestById(Authentication authentication, Long id) {
        User user = resolveUser(authentication);
        AcademicRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic request not found with id: " + id));

        if (user.isStudent()) {
            Department studentDept = requireStudentDepartment(user);
            if (!request.getDepartment().getId().equals(studentDept.getId())) {
                throw new AccessDeniedException("Access denied: Academic request belongs to another department.");
            }
        }

        return AcademicRequestDto.fromEntity(request);
    }

    @Transactional
    public AcademicRequestDto createRequest(Authentication authentication, AcademicRequestDto.CreateRequest createReq) {
        User user = resolveUser(authentication);

        Department targetDept;
        if (user.isStudent()) {
            targetDept = requireStudentDepartment(user);
            if (createReq.getDepartmentId() != null && !createReq.getDepartmentId().equals(targetDept.getId())) {
                throw new AccessDeniedException("Access denied: Cannot create academic request for another department.");
            }
        } else {
            if (createReq.getDepartmentId() == null) {
                throw new IllegalArgumentException("Department ID is required for administrative academic request creation.");
            }
            targetDept = departmentRepository.findById(createReq.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + createReq.getDepartmentId()));
        }

        AcademicRequest request = new AcademicRequest(
                createReq.getTitle().trim(),
                createReq.getDescription(),
                targetDept,
                createReq.getSubjectCode(),
                createReq.getSubjectName(),
                createReq.getSemester(),
                createReq.getResourceType(),
                user
        );

        AcademicRequest saved = requestRepository.save(request);
        return AcademicRequestDto.fromEntity(saved);
    }

    @Transactional
    public void deleteRequest(Authentication authentication, Long id) {
        User user = resolveUser(authentication);
        AcademicRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic request not found with id: " + id));

        if (user.isAdmin() || user.isModerator()) {
            requestRepository.delete(request);
            return;
        }

        Department studentDept = requireStudentDepartment(user);
        if (!request.getDepartment().getId().equals(studentDept.getId())) {
            throw new AccessDeniedException("Access denied: Academic request belongs to another department.");
        }

        boolean isRequester = request.getRequester() != null && Objects.equals(request.getRequester().getId(), user.getId());
        boolean isDeptCoordinator = user.isStudentCoordinator() && authorizationService.isCoordinatorForDepartment(user, studentDept.getId());

        if (!isRequester && !isDeptCoordinator) {
            throw new AccessDeniedException("Access denied: Only the requester, department coordinator, or moderator can delete this request.");
        }

        requestRepository.delete(request);
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
