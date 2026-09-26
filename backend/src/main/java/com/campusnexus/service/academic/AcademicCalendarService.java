package com.campusnexus.service.academic;

import com.campusnexus.dto.academic.AcademicEventDto;
import com.campusnexus.entity.Department;
import com.campusnexus.entity.User;
import com.campusnexus.entity.academic.AcademicEvent;
import com.campusnexus.entity.academic.EventScope;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.academic.AcademicEventRepository;
import com.campusnexus.security.AuthorizationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AcademicCalendarService {

    private final AcademicEventRepository eventRepository;
    private final DepartmentRepository departmentRepository;
    private final AuthorizationService authorizationService;

    public AcademicCalendarService(AcademicEventRepository eventRepository,
                                   DepartmentRepository departmentRepository,
                                   AuthorizationService authorizationService) {
        this.eventRepository = eventRepository;
        this.departmentRepository = departmentRepository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public List<AcademicEventDto> getEvents(Authentication authentication, Long requestedDepartmentId) {
        User user = resolveUser(authentication);

        if (user.isStudent()) {
            if (user.getDepartment() == null) {
                // Students with no department can only see college-wide global events
                return eventRepository.findAllByScope(EventScope.COLLEGE).stream()
                        .map(AcademicEventDto::fromEntity)
                        .collect(Collectors.toList());
            }
            Department dept = user.getDepartment();
            return eventRepository.findAllCollegeEventsOrDepartmentEvents(dept.getId()).stream()
                    .map(AcademicEventDto::fromEntity)
                    .collect(Collectors.toList());
        }

        // Moderator or Admin
        if (requestedDepartmentId != null) {
            return eventRepository.findAllCollegeEventsOrDepartmentEvents(requestedDepartmentId).stream()
                    .map(AcademicEventDto::fromEntity)
                    .collect(Collectors.toList());
        }

        return eventRepository.findAll().stream()
                .map(AcademicEventDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AcademicEventDto getEventById(Authentication authentication, Long id) {
        User user = resolveUser(authentication);
        AcademicEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic event not found with id: " + id));

        if (event.getScope() == EventScope.COLLEGE) {
            return AcademicEventDto.fromEntity(event);
        }

        // Department-scoped event
        if (user.isStudent()) {
            if (user.getDepartment() == null) {
                throw new AccessDeniedException("Access denied: Student does not belong to any department.");
            }
            if (!event.getDepartment().getId().equals(user.getDepartment().getId())) {
                throw new AccessDeniedException("Access denied: Event belongs to another department.");
            }
        }

        return AcademicEventDto.fromEntity(event);
    }

    @Transactional
    public AcademicEventDto createEvent(Authentication authentication, AcademicEventDto.CreateRequest request) {
        User user = resolveUser(authentication);

        if (request.getScope() == EventScope.COLLEGE) {
            if (!user.isAdmin() && !user.isModerator()) {
                throw new AccessDeniedException("Access denied: Only administrators and moderators can create college-wide events.");
            }
            if (request.getDepartmentId() != null) {
                throw new IllegalArgumentException("College-scoped events must not have a department specified.");
            }

            AcademicEvent event = new AcademicEvent(
                    request.getTitle().trim(),
                    request.getDescription(),
                    EventScope.COLLEGE,
                    null,
                    request.getEventType(),
                    request.getStartDate(),
                    request.getEndDate(),
                    request.getLocation(),
                    request.isImportant()
            );

            AcademicEvent saved = eventRepository.save(event);
            return AcademicEventDto.fromEntity(saved);
        }

        // DEPARTMENT scope
        Department targetDept;
        if (user.isAdmin()) {
            if (request.getDepartmentId() == null) {
                throw new IllegalArgumentException("Department ID is required for department-scoped event creation.");
            }
            targetDept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
        } else if (user.isStudentCoordinator()) {
            if (user.getDepartment() == null) {
                throw new AccessDeniedException("Access denied: Coordinator must belong to a department.");
            }
            targetDept = user.getDepartment();
            if (!authorizationService.isCoordinatorForDepartment(user, targetDept.getId())) {
                throw new AccessDeniedException("Access denied: You are not a coordinator for department: " + targetDept.getCode());
            }
        } else {
            throw new AccessDeniedException("Access denied: Only administrators and department coordinators can create department events.");
        }

        AcademicEvent event = new AcademicEvent(
                request.getTitle().trim(),
                request.getDescription(),
                EventScope.DEPARTMENT,
                targetDept,
                request.getEventType(),
                request.getStartDate(),
                request.getEndDate(),
                request.getLocation(),
                request.isImportant()
        );

        AcademicEvent saved = eventRepository.save(event);
        return AcademicEventDto.fromEntity(saved);
    }

    @Transactional
    public void deleteEvent(Authentication authentication, Long id) {
        User user = resolveUser(authentication);
        AcademicEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic event not found with id: " + id));

        if (user.isAdmin() || user.isModerator()) {
            eventRepository.delete(event);
            return;
        }

        if (event.getScope() == EventScope.DEPARTMENT
                && user.isStudentCoordinator()
                && event.getDepartment() != null
                && authorizationService.isCoordinatorForDepartment(user, event.getDepartment().getId())) {
            eventRepository.delete(event);
            return;
        }

        throw new AccessDeniedException("Access denied: You do not have permission to delete this event.");
    }

    private User resolveUser(Authentication authentication) {
        return authorizationService.resolveAuthenticatedUser(authentication)
                .orElseThrow(() -> new AccessDeniedException("Unauthenticated or invalid user."));
    }
}
