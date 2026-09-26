package com.campusnexus.controller.academic;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.academic.AcademicEventDto;
import com.campusnexus.service.academic.AcademicCalendarService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/academic/calendar")
public class AcademicCalendarController {

    private final AcademicCalendarService calendarService;

    public AcademicCalendarController(AcademicCalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AcademicEventDto>>> getEvents(
            Authentication authentication,
            @RequestParam(name = "departmentId", required = false) Long departmentId) {
        List<AcademicEventDto> events = calendarService.getEvents(authentication, departmentId);
        return ResponseEntity.ok(ApiResponse.success("Academic events retrieved successfully", events));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademicEventDto>> getEventById(
            Authentication authentication,
            @PathVariable("id") Long id) {
        AcademicEventDto event = calendarService.getEventById(authentication, id);
        return ResponseEntity.ok(ApiResponse.success("Academic event retrieved successfully", event));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AcademicEventDto>> createEvent(
            Authentication authentication,
            @Valid @RequestBody AcademicEventDto.CreateRequest request) {
        AcademicEventDto created = calendarService.createEvent(authentication, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Academic event created successfully", created));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            Authentication authentication,
            @PathVariable("id") Long id) {
        calendarService.deleteEvent(authentication, id);
        return ResponseEntity.ok(ApiResponse.success("Academic event deleted successfully", null));
    }
}
