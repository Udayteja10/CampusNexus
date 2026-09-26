package com.campusnexus.repository.campuslife;

import com.campusnexus.entity.campuslife.ClubAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubAnnouncementRepository extends JpaRepository<ClubAnnouncement, Long> {

    @Query("SELECT a FROM ClubAnnouncement a JOIN FETCH a.createdBy WHERE a.club.id = :clubId ORDER BY a.publishedAt DESC")
    List<ClubAnnouncement> findByClubIdOrderByPublishedAtDesc(@Param("clubId") Long clubId);
}
