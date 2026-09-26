package com.campusnexus.repository.campuslife;

import com.campusnexus.entity.campuslife.ClubGalleryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubGalleryItemRepository extends JpaRepository<ClubGalleryItem, Long> {

    @Query("SELECT g FROM ClubGalleryItem g JOIN FETCH g.uploadedBy WHERE g.club.id = :clubId ORDER BY g.createdAt DESC")
    List<ClubGalleryItem> findByClubIdOrderByCreatedAtDesc(@Param("clubId") Long clubId);
}
