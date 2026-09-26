package com.campusnexus.service.campuslife;

import com.campusnexus.dto.campuslife.MarketplaceListingRequestDto;
import com.campusnexus.dto.campuslife.MarketplaceListingResponseDto;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.ItemCondition;
import com.campusnexus.entity.campuslife.ListingStatus;
import com.campusnexus.entity.campuslife.MarketplaceCategory;
import com.campusnexus.entity.campuslife.MarketplaceListing;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.campuslife.MarketplaceListingRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketplaceService {

    private final MarketplaceListingRepository listingRepository;

    public MarketplaceService(MarketplaceListingRepository listingRepository) {
        this.listingRepository = listingRepository;
    }

    @Transactional(readOnly = true)
    public List<MarketplaceListingResponseDto> searchListings(
            MarketplaceCategory category,
            ListingStatus status,
            ItemCondition conditionType,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String keyword
    ) {
        return listingRepository.searchListings(category, status, conditionType, minPrice, maxPrice, keyword)
                .stream()
                .map(MarketplaceListingResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MarketplaceListingResponseDto> getMyListings(User currentUser) {
        return listingRepository.findBySellerId(currentUser.getId())
                .stream()
                .map(MarketplaceListingResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MarketplaceListingResponseDto getListingById(Long id) {
        MarketplaceListing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marketplace listing not found with ID: " + id));
        return MarketplaceListingResponseDto.fromEntity(listing);
    }

    @Transactional
    public MarketplaceListingResponseDto createListing(MarketplaceListingRequestDto dto, User currentUser) {
        if (dto.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price cannot be negative.");
        }

        MarketplaceListing listing = new MarketplaceListing(
                currentUser,
                dto.getTitle(),
                dto.getDescription(),
                dto.getCategory(),
                dto.getPrice(),
                dto.getConditionType(),
                dto.getImageUrl(),
                dto.getContactPhone()
        );

        MarketplaceListing saved = listingRepository.save(listing);
        return MarketplaceListingResponseDto.fromEntity(saved);
    }

    @Transactional
    public MarketplaceListingResponseDto updateListing(Long id, MarketplaceListingRequestDto dto, User currentUser) {
        MarketplaceListing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marketplace listing not found with ID: " + id));

        // Ownership enforcement: seller or Admin
        if (!listing.getSeller().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw new AccessDeniedException("You do not have permission to modify this marketplace listing.");
        }

        if (dto.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price cannot be negative.");
        }

        listing.setTitle(dto.getTitle());
        listing.setDescription(dto.getDescription());
        listing.setCategory(dto.getCategory());
        listing.setPrice(dto.getPrice());
        listing.setConditionType(dto.getConditionType());
        listing.setImageUrl(dto.getImageUrl());
        listing.setContactPhone(dto.getContactPhone());

        MarketplaceListing updated = listingRepository.save(listing);
        return MarketplaceListingResponseDto.fromEntity(updated);
    }

    @Transactional
    public MarketplaceListingResponseDto updateStatus(Long id, ListingStatus status, User currentUser) {
        MarketplaceListing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marketplace listing not found with ID: " + id));

        // Ownership enforcement: seller or Admin
        if (!listing.getSeller().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw new AccessDeniedException("You do not have permission to update status of this listing.");
        }

        listing.setStatus(status);
        MarketplaceListing updated = listingRepository.save(listing);
        return MarketplaceListingResponseDto.fromEntity(updated);
    }

    @Transactional
    public void deleteListing(Long id, User currentUser) {
        MarketplaceListing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marketplace listing not found with ID: " + id));

        // Ownership enforcement: seller or Admin
        if (!listing.getSeller().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw new AccessDeniedException("You do not have permission to delete this marketplace listing.");
        }

        listingRepository.delete(listing);
    }
}
