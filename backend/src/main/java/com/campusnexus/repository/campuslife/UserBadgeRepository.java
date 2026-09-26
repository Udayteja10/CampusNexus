package com.campusnexus.repository.campuslife;

import com.campusnexus.entity.campuslife.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    @Query("SELECT ub FROM UserBadge ub JOIN FETCH ub.badge LEFT JOIN FETCH ub.awardedBy WHERE ub.user.id = :userId ORDER BY ub.awardedAt DESC")
    List<UserBadge> findByUserId(@Param("userId") Long userId);

    Optional<UserBadge> findByUserIdAndBadgeId(Long userId, Long badgeId);

    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);
}
