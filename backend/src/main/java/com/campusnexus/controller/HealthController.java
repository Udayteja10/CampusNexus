package com.campusnexus.controller;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.service.HealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> checkHealth() {
        Map<String, String> healthData = healthService.getHealthStatus();
        return ResponseEntity.ok(ApiResponse.success("CampusNexus backend is running", healthData));
    }
}
