package com.campusnexus.service.academic;

import com.campusnexus.dto.academic.WikiArticleDto;
import com.campusnexus.entity.Department;
import com.campusnexus.entity.User;
import com.campusnexus.entity.academic.WikiArticle;
import com.campusnexus.entity.academic.WikiCategory;
import com.campusnexus.exception.ResourceNotFoundException;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.academic.WikiArticleRepository;
import com.campusnexus.security.AuthorizationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class WikiService {

    private final WikiArticleRepository wikiArticleRepository;
    private final DepartmentRepository departmentRepository;
    private final AuthorizationService authorizationService;

    public WikiService(WikiArticleRepository wikiArticleRepository,
                       DepartmentRepository departmentRepository,
                       AuthorizationService authorizationService) {
        this.wikiArticleRepository = wikiArticleRepository;
        this.departmentRepository = departmentRepository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public List<WikiArticleDto> getWikiArticles(Authentication authentication, WikiCategory category) {
        // Shared Wiki is globally accessible to all authenticated users
        resolveUser(authentication);

        List<WikiArticle> articles = (category != null)
                ? wikiArticleRepository.findAllByCategory(category)
                : wikiArticleRepository.findAll();

        return articles.stream()
                .map(WikiArticleDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public WikiArticleDto getWikiArticleBySlug(Authentication authentication, String slug) {
        resolveUser(authentication);
        WikiArticle article = wikiArticleRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Wiki article not found with slug: " + slug));

        article.setViewsCount(article.getViewsCount() + 1);
        wikiArticleRepository.save(article);

        return WikiArticleDto.fromEntity(article);
    }

    @Transactional
    public WikiArticleDto createArticle(Authentication authentication, WikiArticleDto.CreateRequest request) {
        User user = resolveUser(authentication);

        if (wikiArticleRepository.existsBySlug(request.getSlug().trim().toLowerCase())) {
            throw new IllegalArgumentException("Wiki article slug already exists: " + request.getSlug());
        }

        Department dept = null;
        if (request.getDepartmentId() != null) {
            dept = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        }

        WikiArticle article = new WikiArticle(
                request.getSlug().trim().toLowerCase(),
                request.getTitle().trim(),
                request.getContent(),
                request.getCategory(),
                dept,
                user
        );

        WikiArticle saved = wikiArticleRepository.save(article);
        return WikiArticleDto.fromEntity(saved);
    }

    @Transactional
    public void deleteArticle(Authentication authentication, Long id) {
        User user = resolveUser(authentication);
        WikiArticle article = wikiArticleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wiki article not found with id: " + id));

        if (user.isAdmin() || user.isModerator()) {
            wikiArticleRepository.delete(article);
            return;
        }

        boolean isAuthor = article.getAuthor() != null && Objects.equals(article.getAuthor().getId(), user.getId());
        if (!isAuthor) {
            throw new AccessDeniedException("Access denied: Only the author, moderator, or admin can delete this wiki article.");
        }

        wikiArticleRepository.delete(article);
    }

    private User resolveUser(Authentication authentication) {
        return authorizationService.resolveAuthenticatedUser(authentication)
                .orElseThrow(() -> new AccessDeniedException("Unauthenticated or invalid user."));
    }
}
