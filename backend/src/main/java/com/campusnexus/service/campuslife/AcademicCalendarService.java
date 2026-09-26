package com.campusnexus.service.campuslife;

import com.campusnexus.dto.campuslife.CalendarEventRequestDto;
import com.campusnexus.dto.campuslife.CalendarEventResponseDto;
import com.campusnexus.entity.Department;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.AcademicCalendarEvent;
import com.campusnexus.entity.campuslife.CalendarEventType;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.campuslife.AcademicCalendarEventRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service("campusLifeCalendarService")
public class AcademicCalendarService {

    private final AcademicCalendarEventRepository calendarEventRepository;
    private final DepartmentRepository departmentRepository;

    public AcademicCalendarService(AcademicCalendarEventRepository calendarEventRepository,
                                   DepartmentRepository departmentRepository) {
        this.calendarEventRepository = calendarEventRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<CalendarEventResponseDto> getEvents(User currentUser, CalendarEventType eventType,
                                                    LocalDateTime startDate, LocalDateTime endDate) {
        if (currentUser.isStudent()) {
            Long departmentId = currentUser.getDepartment() != null ? currentUser.getDepartment().getId() : null;
            Integer yearOfStudy = currentUser.getYearOfStudy();
            return calendarEventRepository.findEventsForStudent(departmentId, yearOfStudy, eventType, startDate, endDate)
                    .stream()
                    .map(CalendarEventResponseDto::fromEntity)
                    .collect(Collectors.toList());
        }

        // Admin or Moderator sees all events matching filters
        return calendarEventRepository.findEventsForStudent(null, null, eventType, startDate, endDate)
                .stream()
                .map(CalendarEventResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CalendarEventResponseDto getEventById(Long id, User currentUser) {
        AcademicCalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar event not found with ID: " + id));

        // Enforce student department isolation if event is department-restricted
        if (currentUser.isStudent() && event.getDepartment() != null) {
            if (currentUser.getDepartment() == null ||
                !currentUser.getDepartment().getId().equals(event.getDepartment().getId())) {
                throw new AccessDeniedException("You do not have access to events outside your department.");
            }
        }

        return CalendarEventResponseDto.fromEntity(event);
    }

    @Transactional
    public CalendarEventResponseDto createEvent(CalendarEventRequestDto dto, User currentUser) {
        if (currentUser.isStudent()) {
            throw new AccessDeniedException("Students are not permitted to create academic calendar events.");
        }

        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date.");
        }

        Department department = null;
        if (dto.getDepartmentId() != null) {
            department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));
        }

        AcademicCalendarEvent event = new AcademicCalendarEvent(
                dto.getTitle(),
                dto.getDescription(),
                dto.getEventType(),
                dto.getStartDate(),
                dto.getEndDate(),
                dto.isAllDay(),
                department,
                dto.getYearOfStudy(),
                currentUser
        );

        AcademicCalendarEvent saved = calendarEventRepository.save(event);
        return CalendarEventResponseDto.fromEntity(saved);
    }

    @Transactional
    public CalendarEventResponseDto updateEvent(Long id, CalendarEventRequestDto dto, User currentUser) {
        if (currentUser.isStudent()) {
            throw new AccessDeniedException("Students are not permitted to update academic calendar events.");
        }

        AcademicCalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar event not found with ID: " + id));

        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date.");
        }

        Department department = null;
        if (dto.getDepartmentId() != null) {
            department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));
        }

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setEventType(dto.getEventType());
        event.setStartDate(dto.getStartDate());
        event.setEndDate(dto.getEndDate());
        event.setAllDay(dto.isAllDay());
        event.setDepartment(department);
        event.setYearOfStudy(dto.getYearOfStudy());

        AcademicCalendarEvent updated = calendarEventRepository.save(event);
        return CalendarEventResponseDto.fromEntity(updated);
    }

    @Transactional
    public void deleteEvent(Long id, User currentUser) {
        if (currentUser.isStudent()) {
            throw new AccessDeniedException("Students are not permitted to delete academic calendar events.");
        }

        AcademicCalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar event not found with ID: " + id));

        calendarEventRepository.delete(event);
    }
}
