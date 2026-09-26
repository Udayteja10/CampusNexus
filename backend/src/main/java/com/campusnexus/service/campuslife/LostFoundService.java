package com.campusnexus.service.campuslife;

import com.campusnexus.dto.campuslife.LostFoundReportRequestDto;
import com.campusnexus.dto.campuslife.LostFoundReportResponseDto;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.LostFoundCategory;
import com.campusnexus.entity.campuslife.LostFoundReport;
import com.campusnexus.entity.campuslife.LostFoundType;
import com.campusnexus.entity.campuslife.ReportStatus;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.campuslife.LostFoundReportRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LostFoundService {

    private final LostFoundReportRepository reportRepository;

    public LostFoundService(LostFoundReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @Transactional(readOnly = true)
    public List<LostFoundReportResponseDto> searchReports(
            LostFoundType type,
            ReportStatus status,
            LostFoundCategory category,
            String location,
            LocalDate fromDate,
            LocalDate toDate,
            String keyword
    ) {
        return reportRepository.searchReports(type, status, category, location, fromDate, toDate, keyword)
                .stream()
                .map(LostFoundReportResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LostFoundReportResponseDto> getMyReports(User currentUser) {
        return reportRepository.findByReportedById(currentUser.getId())
                .stream()
                .map(LostFoundReportResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LostFoundReportResponseDto getReportById(Long id) {
        LostFoundReport report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost & Found report not found with ID: " + id));
        return LostFoundReportResponseDto.fromEntity(report);
    }

    @Transactional
    public LostFoundReportResponseDto createReport(LostFoundReportRequestDto dto, User currentUser) {
        LostFoundReport report = new LostFoundReport(
                dto.getType(),
                dto.getTitle(),
                dto.getDescription(),
                dto.getCategory(),
                dto.getLocation(),
                dto.getEventDate(),
                dto.getImageUrl(),
                dto.getContactInfo(),
                currentUser
        );

        LostFoundReport saved = reportRepository.save(report);
        return LostFoundReportResponseDto.fromEntity(saved);
    }

    @Transactional
    public LostFoundReportResponseDto updateReport(Long id, LostFoundReportRequestDto dto, User currentUser) {
        LostFoundReport report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost & Found report not found with ID: " + id));

        // Ownership enforcement: reporter or Moderator/Admin
        if (!report.getReportedBy().getId().equals(currentUser.getId()) && !currentUser.isAdmin() && !currentUser.isModerator()) {
            throw new AccessDeniedException("You do not have permission to modify this Lost & Found report.");
        }

        report.setType(dto.getType());
        report.setTitle(dto.getTitle());
        report.setDescription(dto.getDescription());
        report.setCategory(dto.getCategory());
        report.setLocation(dto.getLocation());
        report.setEventDate(dto.getEventDate());
        report.setImageUrl(dto.getImageUrl());
        report.setContactInfo(dto.getContactInfo());

        LostFoundReport updated = reportRepository.save(report);
        return LostFoundReportResponseDto.fromEntity(updated);
    }

    @Transactional
    public LostFoundReportResponseDto updateStatus(Long id, ReportStatus status, User currentUser) {
        LostFoundReport report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost & Found report not found with ID: " + id));

        // Ownership enforcement: reporter or Moderator/Admin
        if (!report.getReportedBy().getId().equals(currentUser.getId()) && !currentUser.isAdmin() && !currentUser.isModerator()) {
            throw new AccessDeniedException("You do not have permission to change the status of this report.");
        }

        report.setStatus(status);
        LostFoundReport updated = reportRepository.save(report);
        return LostFoundReportResponseDto.fromEntity(updated);
    }

    @Transactional
    public void deleteReport(Long id, User currentUser) {
        LostFoundReport report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost & Found report not found with ID: " + id));

        // Ownership enforcement: reporter or Admin/Moderator
        if (!report.getReportedBy().getId().equals(currentUser.getId()) && !currentUser.isAdmin() && !currentUser.isModerator()) {
            throw new AccessDeniedException("You do not have permission to delete this report.");
        }

        reportRepository.delete(report);
    }
}
