package com.campusnexus.repository.academic;

import com.campusnexus.entity.academic.WikiArticle;
import com.campusnexus.entity.academic.WikiCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WikiArticleRepository extends JpaRepository<WikiArticle, Long> {

    Optional<WikiArticle> findBySlug(String slug);

    List<WikiArticle> findAllByCategory(WikiCategory category);

    boolean existsBySlug(String slug);
}
