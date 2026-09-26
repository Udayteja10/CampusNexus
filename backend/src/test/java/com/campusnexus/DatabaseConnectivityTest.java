package com.campusnexus;

import com.campusnexus.service.DatabasePingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class DatabaseConnectivityTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DatabasePingService databasePingService;

    @Test
    @DisplayName("DataSource should connect successfully to the MySQL database")
    void testDataSourceConnection() throws SQLException {
        assertThat(dataSource).isNotNull();
        try (Connection connection = dataSource.getConnection()) {
            assertThat(connection).isNotNull();
            assertThat(connection.isValid(2)).isTrue();
            assertThat(connection.getCatalog()).isEqualToIgnoringCase("campusnexus");
        }
    }

    @Test
    @DisplayName("DatabasePingService should confirm database connectivity via SELECT 1")
    void testDatabasePingService() {
        assertThat(databasePingService.isDatabaseConnected()).isTrue();
    }

    @Test
    @DisplayName("Flyway schema history should contain V1 migration")
    void testFlywaySchemaHistory() {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM flyway_schema_history WHERE success = 1 AND script = 'V1__initial_schema.sql'",
                Integer.class
        );
        assertThat(count).isNotNull().isGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("system_metadata infrastructure table should exist and contain initial rows")
    void testSystemMetadataTable() {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM system_metadata",
                Integer.class
        );
        assertThat(count).isNotNull().isGreaterThanOrEqualTo(2);

        String schemaVersion = jdbcTemplate.queryForObject(
                "SELECT value FROM system_metadata WHERE key_name = 'schema_version'",
                String.class
        );
        assertThat(schemaVersion).isEqualTo("1.0.0");

        String appName = jdbcTemplate.queryForObject(
                "SELECT value FROM system_metadata WHERE key_name = 'app_name'",
                String.class
        );
        assertThat(appName).isEqualTo("CampusNexus");
    }
}
