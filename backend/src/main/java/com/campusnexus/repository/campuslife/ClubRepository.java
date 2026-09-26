package com.campusnexus.repository.campuslife;

import com.campusnexus.entity.campuslife.Club;
import com.campusnexus.entity.campuslife.ClubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {

    Optional<Club> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("SELECT c FROM Club c WHERE (:category IS NULL OR c.category = :category) " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY c.name ASC")
    List<Club> searchClubs(
            @Param("category") ClubCategory category,
            @Param("status") String status,
            @Param("keyword") String keyword
    );
}
