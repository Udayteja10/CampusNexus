package com.campusnexus.controller.campuslife;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.campuslife.CalendarEventRequestDto;
import com.campusnexus.dto.campuslife.CalendarEventResponseDto;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.CalendarEventType;
import com.campusnexus.security.AuthorizationService;
import com.campusnexus.service.campuslife.AcademicCalendarService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController("campusLifeCalendarController")
@RequestMapping("/api/v1/calendar")
public class AcademicCalendarController {

    private final AcademicCalendarService calendarService;
    private final AuthorizationService authorizationService;

    public AcademicCalendarController(AcademicCalendarService calendarService,
                                      AuthorizationService authorizationService) {
        this.calendarService = calendarService;
        this.authorizationService = authorizationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CalendarEventResponseDto>>> getEvents(
            Authentication authentication,
            @RequestParam(required = false) CalendarEventType eventType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        User user = resolveUser(authentication);
        List<CalendarEventResponseDto> events = calendarService.getEvents(user, eventType, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Calendar events retrieved successfully", events));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CalendarEventResponseDto>> getEventById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        User user = resolveUser(authentication);
        CalendarEventResponseDto event = calendarService.getEventById(id, user);
        return ResponseEntity.ok(ApiResponse.success("Calendar event retrieved successfully", event));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CalendarEventResponseDto>> createEvent(
            Authentication authentication,
            @Valid @RequestBody CalendarEventRequestDto dto
    ) {
        User user = resolveUser(authentication);
        CalendarEventResponseDto created = calendarService.createEvent(dto, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Calendar event created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CalendarEventResponseDto>> updateEvent(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CalendarEventRequestDto dto
    ) {
        User user = resolveUser(authentication);
        CalendarEventResponseDto updated = calendarService.updateEvent(id, dto, user);
        return ResponseEntity.ok(ApiResponse.success("Calendar event updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            Authentication authentication,
            @PathVariable Long id
    ) {
        User user = resolveUser(authentication);
        calendarService.deleteEvent(id, user);
        return ResponseEntity.ok(ApiResponse.success("Calendar event deleted successfully", null));
    }

    private User resolveUser(Authentication authentication) {
        return authorizationService.resolveAuthenticatedUser(authentication)
                .orElseThrow(() -> new AccessDeniedException("Unauthenticated or invalid user."));
    }
}
