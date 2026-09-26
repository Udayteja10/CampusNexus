package com.campusnexus.repository;

import com.campusnexus.entity.PasswordResetChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetChallengeRepository extends JpaRepository<PasswordResetChallenge, Long> {

    Optional<PasswordResetChallenge> findTopByEmailOrderByIdDesc(String email);

    Optional<PasswordResetChallenge> findTopByUserIdOrderByIdDesc(Long userId);

    List<PasswordResetChallenge> findAllByEmailAndConsumedAtIsNull(String email);

    @Transactional
    void deleteAllByEmail(String email);
}
