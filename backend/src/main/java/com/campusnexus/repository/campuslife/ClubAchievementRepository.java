package com.campusnexus.repository.campuslife;

import com.campusnexus.entity.campuslife.ClubAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubAchievementRepository extends JpaRepository<ClubAchievement, Long> {

    @Query("SELECT a FROM ClubAchievement a WHERE a.club.id = :clubId ORDER BY a.achievementDate DESC")
    List<ClubAchievement> findByClubIdOrderByAchievementDateDesc(@Param("clubId") Long clubId);
}
