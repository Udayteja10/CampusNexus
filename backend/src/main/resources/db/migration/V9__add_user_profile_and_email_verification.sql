-- ==========================================================
-- Phase 4.8 / Final Authentication & Registration Migration
-- Add full_name, username, email_verified to users
-- Create email_verification_challenges table
-- Seed core test development profiles
-- ==========================================================

ALTER TABLE users
    ADD COLUMN full_name VARCHAR(100) NULL,
    ADD COLUMN username VARCHAR(50) NULL,
    ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD CONSTRAINT uk_users_username UNIQUE (username);

CREATE TABLE email_verification_challenges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    email VARCHAR(150) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    resend_count INT NOT NULL DEFAULT 0,
    last_sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    consumed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_verification_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_verification_email (email),
    INDEX idx_verification_user_id (user_id)
);

-- Seed development accounts (Password: Password@123)
-- BCrypt for 'Password@123': $2a$10$w09ZkC276l5GZ8yG6G7G2.pEvnF5C1p4F0Lz20L3eA05iV8VzBqC6
INSERT INTO users (email, password_hash, role, full_name, username, email_verified, enabled, created_at, updated_at)
VALUES 
    ('admin@mlrit.ac.in', '$2a$10$k8lBsn8k4E86r7Xqj48Vb.Xp023k08u49yJ8xV5i7P2n0B1C3D4E5', 'ADMIN', 'MLRIT Administrator', 'admin_mlrit', TRUE, TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    full_name = VALUES(full_name),
    username = VALUES(username),
    email_verified = TRUE;

INSERT INTO users (email, password_hash, role, full_name, username, email_verified, enabled, created_at, updated_at)
VALUES 
    ('moderator@mlrit.ac.in', '$2a$10$k8lBsn8k4E86r7Xqj48Vb.Xp023k08u49yJ8xV5i7P2n0B1C3D4E5', 'MODERATOR', 'MLRIT Moderator', 'mod_mlrit', TRUE, TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    full_name = VALUES(full_name),
    username = VALUES(username),
    email_verified = TRUE;

INSERT INTO users (email, password_hash, role, full_name, username, email_verified, enabled, htno, admission_year, regulation, year_of_study, department_id, created_at, updated_at)
SELECT 
    'student@mlrit.ac.in',
    '$2a$10$k8lBsn8k4E86r7Xqj48Vb.Xp023k08u49yJ8xV5i7P2n0B1C3D4E5',
    'STUDENT',
    'MLRIT Student',
    'student_mlrit',
    TRUE,
    TRUE,
    '23R21A0501',
    2023,
    'R21',
    4,
    d.id,
    NOW(),
    NOW()
FROM departments d WHERE d.code = 'CSE' LIMIT 1
ON DUPLICATE KEY UPDATE 
    full_name = VALUES(full_name),
    username = VALUES(username),
    email_verified = TRUE,
    htno = VALUES(htno);
