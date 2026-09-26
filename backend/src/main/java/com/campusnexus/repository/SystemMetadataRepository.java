package com.campusnexus.repository;

import com.campusnexus.entity.SystemMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemMetadataRepository extends JpaRepository<SystemMetadata, Long> {

    Optional<SystemMetadata> findByKeyName(String keyName);

    boolean existsByKeyName(String keyName);

    void deleteByKeyName(String keyName);
}
