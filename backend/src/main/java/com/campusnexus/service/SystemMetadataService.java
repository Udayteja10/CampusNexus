package com.campusnexus.service;

import com.campusnexus.entity.SystemMetadata;
import com.campusnexus.repository.SystemMetadataRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SystemMetadataService {

    private static final Logger log = LoggerFactory.getLogger(SystemMetadataService.class);
    private final SystemMetadataRepository systemMetadataRepository;

    public SystemMetadataService(SystemMetadataRepository systemMetadataRepository) {
        this.systemMetadataRepository = systemMetadataRepository;
    }

    @Transactional(readOnly = true)
    public Optional<SystemMetadata> getMetadataByKey(String keyName) {
        return systemMetadataRepository.findByKeyName(keyName);
    }

    @Transactional(readOnly = true)
    public List<SystemMetadata> getAllMetadata() {
        return systemMetadataRepository.findAll();
    }

    @Transactional(readOnly = true)
    public boolean existsByKey(String keyName) {
        return systemMetadataRepository.existsByKeyName(keyName);
    }

    @Transactional
    public SystemMetadata saveOrUpdateMetadata(String keyName, String value) {
        log.debug("Saving metadata key: {}", keyName);
        SystemMetadata metadata = systemMetadataRepository.findByKeyName(keyName)
                .map(existing -> {
                    existing.setValue(value);
                    return existing;
                })
                .orElseGet(() -> new SystemMetadata(keyName, value));

        return systemMetadataRepository.save(metadata);
    }

    @Transactional
    public void deleteMetadataByKey(String keyName) {
        log.debug("Deleting metadata key: {}", keyName);
        systemMetadataRepository.deleteByKeyName(keyName);
    }
}
