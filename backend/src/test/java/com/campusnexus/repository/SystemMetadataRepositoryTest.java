package com.campusnexus.repository;

import com.campusnexus.entity.SystemMetadata;
import com.campusnexus.service.SystemMetadataService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class SystemMetadataRepositoryTest {

    @Autowired
    private SystemMetadataRepository systemMetadataRepository;

    @Autowired
    private SystemMetadataService systemMetadataService;

    @Test
    @DisplayName("JPA should read existing seeded metadata rows created by Flyway")
    void shouldReadExistingSeedMetadata() {
        Optional<SystemMetadata> schemaVersion = systemMetadataRepository.findByKeyName("schema_version");
        assertThat(schemaVersion).isPresent();
        assertThat(schemaVersion.get().getValue()).isEqualTo("1.0.0");
        assertThat(schemaVersion.get().getId()).isNotNull();
        assertThat(schemaVersion.get().getCreatedAt()).isNotNull();

        Optional<SystemMetadata> appName = systemMetadataRepository.findByKeyName("app_name");
        assertThat(appName).isPresent();
        assertThat(appName.get().getValue()).isEqualTo("CampusNexus");
        assertThat(appName.get().getId()).isNotNull();
    }

    @Test
    @DisplayName("JPA should successfully save, read back, and delete a verification metadata record")
    void shouldPersistAndRetrieveAndCleanUpMetadata() {
        String testKey = "test_persistence_key";
        String testValue = "test_persistence_value";

        // Clean up in case prior run left it
        if (systemMetadataRepository.existsByKeyName(testKey)) {
            systemMetadataService.deleteMetadataByKey(testKey);
        }

        // Save via service
        SystemMetadata saved = systemMetadataService.saveOrUpdateMetadata(testKey, testValue);
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getKeyName()).isEqualTo(testKey);
        assertThat(saved.getValue()).isEqualTo(testValue);

        // Retrieve via repository
        Optional<SystemMetadata> retrieved = systemMetadataRepository.findByKeyName(testKey);
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getId()).isEqualTo(saved.getId());
        assertThat(retrieved.get().getValue()).isEqualTo(testValue);
        assertThat(retrieved.get().getCreatedAt()).isNotNull();

        // Update value
        String updatedValue = "updated_persistence_value";
        SystemMetadata updated = systemMetadataService.saveOrUpdateMetadata(testKey, updatedValue);
        assertThat(updated.getValue()).isEqualTo(updatedValue);

        Optional<SystemMetadata> retrievedUpdated = systemMetadataRepository.findByKeyName(testKey);
        assertThat(retrievedUpdated).isPresent();
        assertThat(retrievedUpdated.get().getValue()).isEqualTo(updatedValue);

        // Clean up
        systemMetadataService.deleteMetadataByKey(testKey);
        assertThat(systemMetadataRepository.existsByKeyName(testKey)).isFalse();
    }
}
