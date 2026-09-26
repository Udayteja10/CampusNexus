package com.campusnexus.repository.campuslife;

import com.campusnexus.entity.campuslife.LostFoundCategory;
import com.campusnexus.entity.campuslife.LostFoundReport;
import com.campusnexus.entity.campuslife.LostFoundType;
import com.campusnexus.entity.campuslife.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LostFoundReportRepository extends JpaRepository<LostFoundReport, Long> {

    @Query("SELECT r FROM LostFoundReport r JOIN FETCH r.reportedBy " +
           "WHERE (:type IS NULL OR r.type = :type) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:category IS NULL OR r.category = :category) " +
           "AND (:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:fromDate IS NULL OR r.eventDate >= :fromDate) " +
           "AND (:toDate IS NULL OR r.eventDate <= :toDate) " +
           "AND (:keyword IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY r.createdAt DESC")
    List<LostFoundReport> searchReports(
            @Param("type") LostFoundType type,
            @Param("status") ReportStatus status,
            @Param("category") LostFoundCategory category,
            @Param("location") String location,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("keyword") String keyword
    );

    @Query("SELECT r FROM LostFoundReport r JOIN FETCH r.reportedBy WHERE r.reportedBy.id = :userId ORDER BY r.createdAt DESC")
    List<LostFoundReport> findByReportedById(@Param("userId") Long userId);
}
