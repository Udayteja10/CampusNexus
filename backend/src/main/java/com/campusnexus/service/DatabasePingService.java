package com.campusnexus.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DatabasePingService {

    private static final Logger log = LoggerFactory.getLogger(DatabasePingService.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabasePingService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean isDatabaseConnected() {
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return result != null && result == 1;
        } catch (Exception e) {
            log.error("Database ping failed: {}", e.getMessage());
            return false;
        }
    }

    public int getMetadataRecordCount() {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM system_metadata", Integer.class);
        return count != null ? count : 0;
    }
}
