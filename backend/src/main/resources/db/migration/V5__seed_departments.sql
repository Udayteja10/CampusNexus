INSERT INTO departments (code, name, short_name, active) VALUES
    ('CSE', 'Computer Science and Engineering', 'CSE', TRUE),
    ('ECE', 'Electronics and Communication Engineering', 'ECE', TRUE),
    ('EEE', 'Electrical and Electronics Engineering', 'EEE', TRUE),
    ('IT', 'Information Technology', 'IT', TRUE),
    ('CSM', 'Computer Science and Engineering (Artificial Intelligence and Machine Learning)', 'CSM', TRUE),
    ('CSD', 'Computer Science and Engineering (Data Science)', 'CSD', TRUE),
    ('CSIT', 'Computer Science and Information Technology', 'CSIT', TRUE),
    ('MECH', 'Mechanical Engineering', 'MECH', TRUE),
    ('CIVIL', 'Civil Engineering', 'CIVIL', TRUE);

ALTER TABLE users
    DROP COLUMN department,
    ADD COLUMN department_id BIGINT NULL,
    ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL;
