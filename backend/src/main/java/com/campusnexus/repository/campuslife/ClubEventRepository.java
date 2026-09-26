package com.campusnexus.repository.campuslife;

import com.campusnexus.entity.campuslife.ClubEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubEventRepository extends JpaRepository<ClubEvent, Long> {

    @Query("SELECT e FROM ClubEvent e WHERE e.club.id = :clubId ORDER BY e.startDateTime ASC")
    List<ClubEvent> findByClubIdOrderByStartDateTimeAsc(@Param("clubId") Long clubId);

    @Query("SELECT e FROM ClubEvent e JOIN FETCH e.club ORDER BY e.startDateTime ASC")
    List<ClubEvent> findAllUpcomingEvents();
}
