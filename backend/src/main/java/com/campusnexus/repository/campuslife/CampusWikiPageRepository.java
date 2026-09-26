package com.campusnexus.repository.campuslife;

import com.campusnexus.entity.campuslife.CampusWikiCategory;
import com.campusnexus.entity.campuslife.CampusWikiPage;
import com.campusnexus.entity.campuslife.WikiStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampusWikiPageRepository extends JpaRepository<CampusWikiPage, Long> {

    Optional<CampusWikiPage> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("SELECT w FROM CampusWikiPage w JOIN FETCH w.author " +
           "WHERE (:status IS NULL OR w.status = :status) " +
           "AND (:category IS NULL OR w.category = :category) " +
           "AND (:keyword IS NULL OR LOWER(w.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(w.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY w.updatedAt DESC")
    List<CampusWikiPage> searchWikiPages(
            @Param("status") WikiStatus status,
            @Param("category") CampusWikiCategory category,
            @Param("keyword") String keyword
    );

    @Query("SELECT w FROM CampusWikiPage w JOIN FETCH w.author WHERE w.author.id = :authorId ORDER BY w.updatedAt DESC")
    List<CampusWikiPage> findByAuthorId(@Param("authorId") Long authorId);
}
