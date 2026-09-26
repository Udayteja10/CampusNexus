package com.campusnexus.repository;

import com.campusnexus.entity.EmailVerificationChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface EmailVerificationChallengeRepository extends JpaRepository<EmailVerificationChallenge, Long> {

    Optional<EmailVerificationChallenge> findTopByEmailOrderByIdDesc(String email);

    Optional<EmailVerificationChallenge> findTopByUserIdOrderByIdDesc(Long userId);

    @Transactional
    void deleteAllByEmail(String email);
}
