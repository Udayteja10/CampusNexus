package com.campusnexus.service.campuslife;

import com.campusnexus.dto.campuslife.CampusWikiPageRequestDto;
import com.campusnexus.dto.campuslife.CampusWikiPageResponseDto;
import com.campusnexus.dto.campuslife.WikiModerationDto;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.CampusWikiCategory;
import com.campusnexus.entity.campuslife.CampusWikiPage;
import com.campusnexus.entity.campuslife.WikiStatus;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.campuslife.CampusWikiPageRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service("campusLifeWikiService")
public class CampusWikiService {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private final CampusWikiPageRepository wikiRepository;

    public CampusWikiService(CampusWikiPageRepository wikiRepository) {
        this.wikiRepository = wikiRepository;
    }

    @Transactional(readOnly = true)
    public List<CampusWikiPageResponseDto> searchPages(
            WikiStatus status,
            CampusWikiCategory category,
            String keyword,
            User currentUser
    ) {
        // Students can only see published articles
        WikiStatus effectiveStatus = currentUser.isStudent() ? WikiStatus.PUBLISHED : status;

        return wikiRepository.searchWikiPages(effectiveStatus, category, keyword)
                .stream()
                .map(CampusWikiPageResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CampusWikiPageResponseDto> getMyPages(User currentUser) {
        return wikiRepository.findByAuthorId(currentUser.getId())
                .stream()
                .map(CampusWikiPageResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CampusWikiPageResponseDto getPageBySlug(String slug, User currentUser) {
        CampusWikiPage page = wikiRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Campus Wiki page not found with slug: " + slug));

        if (currentUser.isStudent() && page.getStatus() != WikiStatus.PUBLISHED) {
            if (!page.getAuthor().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("This wiki page is currently under review or unpublished.");
            }
        }

        page.setViewsCount(page.getViewsCount() + 1);
        wikiRepository.save(page);

        return CampusWikiPageResponseDto.fromEntity(page);
    }

    @Transactional(readOnly = true)
    public CampusWikiPageResponseDto getPageById(Long id, User currentUser) {
        CampusWikiPage page = wikiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campus Wiki page not found with ID: " + id));

        if (currentUser.isStudent() && page.getStatus() != WikiStatus.PUBLISHED) {
            if (!page.getAuthor().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("This wiki page is currently under review or unpublished.");
            }
        }

        return CampusWikiPageResponseDto.fromEntity(page);
    }

    @Transactional
    public CampusWikiPageResponseDto createPage(CampusWikiPageRequestDto dto, User currentUser) {
        String slug = dto.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = toSlug(dto.getTitle());
        } else {
            slug = toSlug(slug);
        }

        if (wikiRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis() % 10000;
        }

        WikiStatus initialStatus = currentUser.isStudent() ? WikiStatus.PENDING_REVIEW : WikiStatus.PUBLISHED;

        CampusWikiPage page = new CampusWikiPage(
                dto.getTitle(),
                slug,
                dto.getContent(),
                dto.getCategory(),
                currentUser,
                initialStatus
        );

        CampusWikiPage saved = wikiRepository.save(page);
        return CampusWikiPageResponseDto.fromEntity(saved);
    }

    @Transactional
    public CampusWikiPageResponseDto updatePage(Long id, CampusWikiPageRequestDto dto, User currentUser) {
        CampusWikiPage page = wikiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campus Wiki page not found with ID: " + id));

        boolean isAuthor = page.getAuthor().getId().equals(currentUser.getId());
        boolean isStaff = currentUser.isAdmin() || currentUser.isModerator();

        if (!isAuthor && !isStaff) {
            throw new AccessDeniedException("You do not have permission to edit this wiki page.");
        }

        page.setTitle(dto.getTitle());
        page.setContent(dto.getContent());
        page.setCategory(dto.getCategory());

        if (dto.getSlug() != null && !dto.getSlug().isBlank()) {
            String newSlug = toSlug(dto.getSlug());
            if (!newSlug.equals(page.getSlug()) && wikiRepository.existsBySlug(newSlug)) {
                throw new IllegalArgumentException("A wiki page with this slug already exists: " + newSlug);
            }
            page.setSlug(newSlug);
        }

        // If student modified a rejected or draft page, send for review
        if (currentUser.isStudent()) {
            page.setStatus(WikiStatus.PENDING_REVIEW);
            page.setRejectionReason(null);
        }

        CampusWikiPage updated = wikiRepository.save(page);
        return CampusWikiPageResponseDto.fromEntity(updated);
    }

    @Transactional
    public CampusWikiPageResponseDto moderatePage(Long id, WikiModerationDto dto, User currentUser) {
        if (currentUser.isStudent()) {
            throw new AccessDeniedException("Only moderators and administrators can moderate wiki pages.");
        }

        CampusWikiPage page = wikiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campus Wiki page not found with ID: " + id));

        if (dto.getStatus() != WikiStatus.PUBLISHED && dto.getStatus() != WikiStatus.REJECTED) {
            throw new IllegalArgumentException("Moderation status must be PUBLISHED or REJECTED.");
        }

        page.setStatus(dto.getStatus());
        if (dto.getStatus() == WikiStatus.REJECTED) {
            page.setRejectionReason(dto.getRejectionReason());
        } else {
            page.setRejectionReason(null);
        }

        CampusWikiPage updated = wikiRepository.save(page);
        return CampusWikiPageResponseDto.fromEntity(updated);
    }

    @Transactional
    public void deletePage(Long id, User currentUser) {
        CampusWikiPage page = wikiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campus Wiki page not found with ID: " + id));

        boolean isAuthor = page.getAuthor().getId().equals(currentUser.getId());
        boolean isStaff = currentUser.isAdmin() || currentUser.isModerator();

        if (!isStaff && (!isAuthor || page.getStatus() == WikiStatus.PUBLISHED)) {
            throw new AccessDeniedException("You do not have permission to delete this wiki page.");
        }

        wikiRepository.delete(page);
    }

    private String toSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
