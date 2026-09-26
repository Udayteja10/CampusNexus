ALTER TABLE users
    ADD COLUMN coordinator_department_id BIGINT NULL,
    ADD CONSTRAINT fk_users_coordinator_department FOREIGN KEY (coordinator_department_id) REFERENCES departments (id) ON DELETE SET NULL,
    ADD CONSTRAINT uk_users_coordinator_department UNIQUE (coordinator_department_id);
