package com.campusnexus.controller.academic;

import com.campusnexus.dto.ApiResponse;
import com.campusnexus.dto.academic.WikiArticleDto;
import com.campusnexus.entity.academic.WikiCategory;
import com.campusnexus.service.academic.WikiService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/academic/wiki")
public class WikiController {

    private final WikiService wikiService;

    public WikiController(WikiService wikiService) {
        this.wikiService = wikiService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WikiArticleDto>>> getWikiArticles(
            Authentication authentication,
            @RequestParam(name = "category", required = false) WikiCategory category) {
        List<WikiArticleDto> articles = wikiService.getWikiArticles(authentication, category);
        return ResponseEntity.ok(ApiResponse.success("Wiki articles retrieved successfully", articles));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<WikiArticleDto>> getWikiArticleBySlug(
            Authentication authentication,
            @PathVariable("slug") String slug) {
        WikiArticleDto article = wikiService.getWikiArticleBySlug(authentication, slug);
        return ResponseEntity.ok(ApiResponse.success("Wiki article retrieved successfully", article));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WikiArticleDto>> createArticle(
            Authentication authentication,
            @Valid @RequestBody WikiArticleDto.CreateRequest request) {
        WikiArticleDto created = wikiService.createArticle(authentication, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Wiki article created successfully", created));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteArticle(
            Authentication authentication,
            @PathVariable("id") Long id) {
        wikiService.deleteArticle(authentication, id);
        return ResponseEntity.ok(ApiResponse.success("Wiki article deleted successfully", null));
    }
}
