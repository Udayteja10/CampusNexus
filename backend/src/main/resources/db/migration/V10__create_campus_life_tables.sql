-- ==========================================================
-- Phase 6: Campus Life Schema Migration
-- Creates tables for:
-- 1. Academic Calendar Events
-- 2. Clubs, Club Announcements, Events, Gallery, Achievements
-- 3. Student Marketplace Listings
-- 4. Lost & Found Reports
-- 5. Campus Wiki Pages (with moderation workflow)
-- 6. Achievement Badges & User Badge Awards
-- ==========================================================

-- 1. Academic Calendar Events
CREATE TABLE academic_calendar_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    event_type VARCHAR(50) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    all_day BOOLEAN NOT NULL DEFAULT FALSE,
    department_id BIGINT NULL,
    year_of_study INT NULL,
    created_by_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cal_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_cal_creator FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_cal_dept (department_id),
    INDEX idx_cal_type (event_type),
    INDEX idx_cal_dates (start_date, end_date)
);

-- 2. Clubs
CREATE TABLE clubs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NULL,
    category VARCHAR(50) NOT NULL,
    logo_url VARCHAR(500) NULL,
    cover_url VARCHAR(500) NULL,
    contact_email VARCHAR(150) NULL,
    social_links TEXT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clubs_category (category),
    INDEX idx_clubs_status (status)
);

-- Club Announcements
CREATE TABLE club_announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    club_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_club_ann_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    CONSTRAINT fk_club_ann_creator FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_club_ann_club_id (club_id)
);

-- Club Events
CREATE TABLE club_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    club_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    venue VARCHAR(200) NULL,
    start_date_time TIMESTAMP NOT NULL,
    end_date_time TIMESTAMP NOT NULL,
    registration_link VARCHAR(500) NULL,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_club_events_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    INDEX idx_club_events_club_id (club_id)
);

-- Club Gallery
CREATE TABLE club_gallery_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    club_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255) NULL,
    uploaded_by_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_club_gal_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    CONSTRAINT fk_club_gal_uploader FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_club_gal_club_id (club_id)
);

-- Club Achievements
CREATE TABLE club_achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    club_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    achievement_date DATE NOT NULL,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_club_ach_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    INDEX idx_club_ach_club_id (club_id)
);

-- 3. Student Marketplace Listings
CREATE TABLE marketplace_listings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    seller_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    condition_type VARCHAR(50) NOT NULL,
    image_url VARCHAR(500) NULL,
    contact_phone VARCHAR(50) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mkt_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_mkt_seller (seller_id),
    INDEX idx_mkt_status (status),
    INDEX idx_mkt_category (category)
);

-- 4. Lost & Found Reports
CREATE TABLE lost_found_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    location VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    image_url VARCHAR(500) NULL,
    contact_info VARCHAR(150) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    reported_by_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lf_reporter FOREIGN KEY (reported_by_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_lf_type_status (type, status),
    INDEX idx_lf_reported_by (reported_by_id)
);

-- 5. Campus Wiki Pages (Student Knowledge Base with Moderation)
CREATE TABLE campus_wiki_pages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content MEDIUMTEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    author_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    rejection_reason TEXT NULL,
    views_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wiki_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_wiki_slug (slug),
    INDEX idx_wiki_status_cat (status, category),
    INDEX idx_wiki_author (author_id)
);

-- 6. Badges & User Badges
CREATE TABLE badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon VARCHAR(100) NOT NULL,
    criteria VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    badge_id BIGINT NOT NULL,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    awarded_by_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ub_badge FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    CONSTRAINT fk_ub_awarder FOREIGN KEY (awarded_by_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uk_user_badge UNIQUE (user_id, badge_id),
    INDEX idx_ub_user (user_id),
    INDEX idx_ub_badge (badge_id)
);

-- Seed Badges
INSERT INTO badges (name, description, icon, criteria) VALUES
('COMMUNITY_CONTRIBUTOR', 'Awarded to students actively contributing to campus resources and community discussions.', 'Award', 'Submit 5+ approved academic or campus resources'),
('HELPFUL_STUDENT', 'Recognized for helping fellow students in Lost & Found or marketplace exchanges.', 'HeartHandshake', 'Successfully resolve 3+ Lost & Found or exchange items'),
('EVENT_PARTICIPANT', 'Active participant in campus club events and technical hackathons.', 'Trophy', 'Participate in verified campus club events'),
('WIKI_CONTRIBUTOR', 'Author of verified and published Campus Wiki knowledge articles.', 'BookOpen', 'Publish approved campus wiki guides'),
('CAMPUS_HELPER', 'Exemplary peer support, answering questions and aiding first-year students.', 'Sparkles', 'Distinguished community assistance');

-- Seed Sample Clubs
INSERT INTO clubs (name, slug, description, category, logo_url, cover_url, contact_email, social_links, status) VALUES
('Coding Club MLRIT', 'coding-club', 'The premier student developer club hosting algorithmic contests, hackathons, and open-source projects.', 'TECHNICAL', '/images/clubs/coding.png', '/images/clubs/coding-cover.png', 'codingclub@mlrit.ac.in', '{"github": "https://github.com/mlrit", "instagram": "https://instagram.com/codingmlrit"}', 'ACTIVE'),
('Robotics & Automation Society', 'robotics-society', 'Building autonomous rovers, drones, and competing in national robotics challenges.', 'TECHNICAL', '/images/clubs/robotics.png', '/images/clubs/robotics-cover.png', 'robotics@mlrit.ac.in', '{"linkedin": "https://linkedin.com/company/robotics-mlrit"}', 'ACTIVE'),
('Crescendo - Cultural Club', 'crescendo', 'Fostering music, dance, theater, and arts across all campus festivals.', 'CULTURAL', '/images/clubs/cultural.png', '/images/clubs/cultural-cover.png', 'crescendo@mlrit.ac.in', '{"instagram": "https://instagram.com/crescendo_mlrit"}', 'ACTIVE'),
('Literary & Debating Society', 'lit-debating', 'Sharpening oratory skills, parliamentary debates, and creative writing.', 'LITERARY', '/images/clubs/literary.png', '/images/clubs/literary-cover.png', 'literary@mlrit.ac.in', '{"twitter": "https://twitter.com/litmlrit"}', 'ACTIVE'),
('MLRIT Sports Arena', 'sports-club', 'Organizing inter-college tournaments, cricket, football, basketball, and athletic meets.', 'SPORTS', '/images/clubs/sports.png', '/images/clubs/sports-cover.png', 'sports@mlrit.ac.in', '{"instagram": "https://instagram.com/sports_mlrit"}', 'ACTIVE');
