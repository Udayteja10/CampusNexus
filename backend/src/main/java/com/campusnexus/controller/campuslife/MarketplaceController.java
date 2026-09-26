package com.campusnexus.controller.campuslife;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.campuslife.MarketplaceListingRequestDto;
import com.campusnexus.dto.campuslife.MarketplaceListingResponseDto;
import com.campusnexus.dto.campuslife.MarketplaceStatusUpdateDto;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.ItemCondition;
import com.campusnexus.entity.campuslife.ListingStatus;
import com.campusnexus.entity.campuslife.MarketplaceCategory;
import com.campusnexus.security.AuthorizationService;
import com.campusnexus.service.campuslife.MarketplaceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/marketplace")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;
    private final AuthorizationService authorizationService;

    public MarketplaceController(MarketplaceService marketplaceService,
                                 AuthorizationService authorizationService) {
        this.marketplaceService = marketplaceService;
        this.authorizationService = authorizationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MarketplaceListingResponseDto>>> searchListings(
            @RequestParam(required = false) MarketplaceCategory category,
            @RequestParam(required = false) ListingStatus status,
            @RequestParam(required = false) ItemCondition conditionType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String keyword
    ) {
        List<MarketplaceListingResponseDto> listings = marketplaceService.searchListings(
                category, status, conditionType, minPrice, maxPrice, keyword
        );
        return ResponseEntity.ok(ApiResponse.success("Marketplace listings retrieved successfully", listings));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<MarketplaceListingResponseDto>>> getMyListings(
            Authentication authentication
    ) {
        User user = resolveUser(authentication);
        List<MarketplaceListingResponseDto> listings = marketplaceService.getMyListings(user);
        return ResponseEntity.ok(ApiResponse.success("User marketplace listings retrieved successfully", listings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MarketplaceListingResponseDto>> getListingById(@PathVariable Long id) {
        MarketplaceListingResponseDto listing = marketplaceService.getListingById(id);
        return ResponseEntity.ok(ApiResponse.success("Marketplace listing retrieved successfully", listing));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MarketplaceListingResponseDto>> createListing(
            Authentication authentication,
            @Valid @RequestBody MarketplaceListingRequestDto dto
    ) {
        User user = resolveUser(authentication);
        MarketplaceListingResponseDto created = marketplaceService.createListing(dto, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Marketplace listing created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MarketplaceListingResponseDto>> updateListing(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody MarketplaceListingRequestDto dto
    ) {
        User user = resolveUser(authentication);
        MarketplaceListingResponseDto updated = marketplaceService.updateListing(id, dto, user);
        return ResponseEntity.ok(ApiResponse.success("Marketplace listing updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<MarketplaceListingResponseDto>> updateStatus(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody MarketplaceStatusUpdateDto dto
    ) {
        User user = resolveUser(authentication);
        MarketplaceListingResponseDto updated = marketplaceService.updateStatus(id, dto.getStatus(), user);
        return ResponseEntity.ok(ApiResponse.success("Marketplace listing status updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteListing(
            Authentication authentication,
            @PathVariable Long id
    ) {
        User user = resolveUser(authentication);
        marketplaceService.deleteListing(id, user);
        return ResponseEntity.ok(ApiResponse.success("Marketplace listing deleted successfully", null));
    }

    private User resolveUser(Authentication authentication) {
        return authorizationService.resolveAuthenticatedUser(authentication)
                .orElseThrow(() -> new AccessDeniedException("Unauthenticated or invalid user."));
    }
}
