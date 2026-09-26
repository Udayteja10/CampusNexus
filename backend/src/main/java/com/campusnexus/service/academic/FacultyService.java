package com.campusnexus.service.academic;

import com.campusnexus.dto.academic.FacultyDto;
import com.campusnexus.dto.academic.FacultyReviewDto;
import com.campusnexus.entity.Department;
import com.campusnexus.entity.User;
import com.campusnexus.entity.academic.Faculty;
import com.campusnexus.entity.academic.FacultyReview;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.academic.FacultyRepository;
import com.campusnexus.repository.academic.FacultyReviewRepository;
import com.campusnexus.security.AuthorizationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final FacultyReviewRepository facultyReviewRepository;
    private final DepartmentRepository departmentRepository;
    private final AuthorizationService authorizationService;

    public FacultyService(FacultyRepository facultyRepository,
                          FacultyReviewRepository facultyReviewRepository,
                          DepartmentRepository departmentRepository,
                          AuthorizationService authorizationService) {
        this.facultyRepository = facultyRepository;
        this.facultyReviewRepository = facultyReviewRepository;
        this.departmentRepository = departmentRepository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public List<FacultyDto> getFacultyList(Authentication authentication, Long requestedDepartmentId) {
        User user = resolveUser(authentication);

        if (user.isStudent()) {
            Department dept = requireStudentDepartment(user);
            return facultyRepository.findAllByDepartmentId(dept.getId()).stream()
                    .map(FacultyDto::fromEntity)
                    .collect(Collectors.toList());
        }

        // Moderator or Admin
        if (requestedDepartmentId != null) {
            return facultyRepository.findAllByDepartmentId(requestedDepartmentId).stream()
                    .map(FacultyDto::fromEntity)
                    .collect(Collectors.toList());
        }

        return facultyRepository.findAll().stream()
                .map(FacultyDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FacultyDto getFacultyById(Authentication authentication, Long id) {
        User user = resolveUser(authentication);
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + id));

        if (user.isStudent()) {
            Department studentDept = requireStudentDepartment(user);
            if (!faculty.getDepartment().getId().equals(studentDept.getId())) {
                throw new AccessDeniedException("Access denied: Faculty belongs to another department.");
            }
        }

        return FacultyDto.fromEntity(faculty);
    }

    @Transactional
    public FacultyDto createFaculty(Authentication authentication, FacultyDto.CreateRequest request) {
        User user = resolveUser(authentication);

        Department targetDept;
        if (user.isAdmin()) {
            if (request.getDepartmentId() == null) {
                throw new IllegalArgumentException("Department ID is required for administrative faculty creation.");
            }
            targetDept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
        } else if (user.isStudentCoordinator()) {
            targetDept = requireStudentDepartment(user);
            if (!authorizationService.isCoordinatorForDepartment(user, targetDept.getId())) {
                throw new AccessDeniedException("Access denied: You are not a coordinator for department: " + targetDept.getCode());
            }
        } else {
            throw new AccessDeniedException("Access denied: Only administrators and coordinators can create faculty records.");
        }

        Faculty faculty = new Faculty(
                request.getName().trim(),
                request.getDesignation().trim(),
                targetDept,
                request.getEmail(),
                request.getCabinLocation(),
                request.getOfficeHours()
        );

        Faculty saved = facultyRepository.save(faculty);
        return FacultyDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<FacultyReviewDto> getReviewsForFaculty(Authentication authentication, Long facultyId) {
        User user = resolveUser(authentication);
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + facultyId));

        if (user.isStudent()) {
            Department studentDept = requireStudentDepartment(user);
            if (!faculty.getDepartment().getId().equals(studentDept.getId())) {
                throw new AccessDeniedException("Access denied: Faculty belongs to another department.");
            }
        }

        return facultyReviewRepository.findAllByFacultyId(facultyId).stream()
                .map(FacultyReviewDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public FacultyReviewDto createReview(Authentication authentication, FacultyReviewDto.CreateRequest request) {
        User user = resolveUser(authentication);
        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + request.getFacultyId()));

        if (user.isStudent()) {
            Department studentDept = requireStudentDepartment(user);
            if (!faculty.getDepartment().getId().equals(studentDept.getId())) {
                throw new AccessDeniedException("Access denied: Cannot review faculty of another department.");
            }
        }

        FacultyReview review = new FacultyReview(
                faculty,
                user,
                request.isAnonymous(),
                request.getRating(),
                request.getComment(),
                request.getSemester()
        );

        FacultyReview saved = facultyReviewRepository.save(review);

        // Update faculty average rating and review count
        int count = faculty.getReviewCount() != null ? faculty.getReviewCount() : 0;
        double currentRating = faculty.getRating() != null ? faculty.getRating() : 0.0;
        double newRating = ((currentRating * count) + request.getRating()) / (count + 1);
        faculty.setRating(Math.round(newRating * 10.0) / 10.0);
        faculty.setReviewCount(count + 1);
        facultyRepository.save(faculty);

        return FacultyReviewDto.fromEntity(saved);
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
