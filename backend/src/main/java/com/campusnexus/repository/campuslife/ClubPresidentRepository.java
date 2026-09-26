package com.campusnexus.repository.campuslife;

import com.campusnexus.entity.campuslife.ClubPresident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubPresidentRepository extends JpaRepository<ClubPresident, Long> {

    @Query("SELECT cp FROM ClubPresident cp " +
           "JOIN FETCH cp.club c " +
           "JOIN FETCH cp.user u " +
           "WHERE cp.club.id = :clubId AND cp.active = true")
    Optional<ClubPresident> findByClubIdAndActiveTrue(@Param("clubId") Long clubId);

    @Query("SELECT cp FROM ClubPresident cp " +
           "JOIN FETCH cp.club c " +
           "JOIN FETCH cp.user u " +
           "WHERE cp.user.id = :userId AND cp.active = true")
    List<ClubPresident> findByUserIdAndActiveTrue(@Param("userId") Long userId);

    @Query("SELECT COUNT(cp) > 0 FROM ClubPresident cp " +
           "WHERE cp.club.id = :clubId AND cp.user.id = :userId AND cp.active = true")
    boolean existsByClubIdAndUserIdAndActiveTrue(@Param("clubId") Long clubId, @Param("userId") Long userId);

    @Query("SELECT cp FROM ClubPresident cp " +
           "JOIN FETCH cp.club c " +
           "JOIN FETCH cp.user u " +
           "WHERE cp.club.id = :clubId " +
           "ORDER BY cp.assignedAt DESC")
    List<ClubPresident> findByClubIdOrderByAssignedAtDesc(@Param("clubId") Long clubId);

    @Query("SELECT cp FROM ClubPresident cp " +
           "JOIN FETCH cp.club c " +
           "JOIN FETCH cp.user u " +
           "WHERE cp.active = true")
    List<ClubPresident> findAllActive();
}
