package com.campusnexus.repository.campuslife;

import com.campusnexus.entity.campuslife.ItemCondition;
import com.campusnexus.entity.campuslife.ListingStatus;
import com.campusnexus.entity.campuslife.MarketplaceCategory;
import com.campusnexus.entity.campuslife.MarketplaceListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface MarketplaceListingRepository extends JpaRepository<MarketplaceListing, Long> {

    @Query("SELECT m FROM MarketplaceListing m JOIN FETCH m.seller " +
           "WHERE (:category IS NULL OR m.category = :category) " +
           "AND (:status IS NULL OR m.status = :status) " +
           "AND (:conditionType IS NULL OR m.conditionType = :conditionType) " +
           "AND (:minPrice IS NULL OR m.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR m.price <= :maxPrice) " +
           "AND (:keyword IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY m.createdAt DESC")
    List<MarketplaceListing> searchListings(
            @Param("category") MarketplaceCategory category,
            @Param("status") ListingStatus status,
            @Param("conditionType") ItemCondition conditionType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("keyword") String keyword
    );

    @Query("SELECT m FROM MarketplaceListing m JOIN FETCH m.seller WHERE m.seller.id = :sellerId ORDER BY m.createdAt DESC")
    List<MarketplaceListing> findBySellerId(@Param("sellerId") Long sellerId);
}
