package com.campusnexus.repository.campuslife;

import com.campusnexus.entity.campuslife.AcademicCalendarEvent;
import com.campusnexus.entity.campuslife.CalendarEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AcademicCalendarEventRepository extends JpaRepository<AcademicCalendarEvent, Long> {

    @Query("SELECT e FROM AcademicCalendarEvent e LEFT JOIN FETCH e.department LEFT JOIN FETCH e.createdBy " +
           "WHERE (:departmentId IS NULL OR e.department IS NULL OR e.department.id = :departmentId) " +
           "AND (:yearOfStudy IS NULL OR e.yearOfStudy IS NULL OR e.yearOfStudy = :yearOfStudy) " +
           "AND (:eventType IS NULL OR e.eventType = :eventType) " +
           "AND (:startDate IS NULL OR e.endDate >= :startDate) " +
           "AND (:endDate IS NULL OR e.startDate <= :endDate) " +
           "ORDER BY e.startDate ASC")
    List<AcademicCalendarEvent> findEventsForStudent(
            @Param("departmentId") Long departmentId,
            @Param("yearOfStudy") Integer yearOfStudy,
            @Param("eventType") CalendarEventType eventType,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT e FROM AcademicCalendarEvent e LEFT JOIN FETCH e.department LEFT JOIN FETCH e.createdBy " +
           "WHERE (:departmentId IS NULL OR e.department IS NULL OR e.department.id = :departmentId) " +
           "AND (:eventType IS NULL OR e.eventType = :eventType) " +
           "ORDER BY e.startDate ASC")
    List<AcademicCalendarEvent> findAllEventsFiltered(
            @Param("departmentId") Long departmentId,
            @Param("eventType") CalendarEventType eventType
    );
}
