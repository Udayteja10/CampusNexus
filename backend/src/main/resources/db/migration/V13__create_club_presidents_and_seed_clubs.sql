-- ==========================================================
-- Migration V13: Create Club Presidents Table and Seed Official Campus Clubs
-- ==========================================================

-- 1. Create club_presidents table
CREATE TABLE IF NOT EXISTS club_presidents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    club_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    designation VARCHAR(100) NOT NULL DEFAULT 'PRESIDENT',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by_id BIGINT NULL,
    removed_at TIMESTAMP NULL,
    removed_by_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cpres_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    CONSTRAINT fk_cpres_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_cpres_assigner FOREIGN KEY (assigned_by_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_cpres_remover FOREIGN KEY (removed_by_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_cp_club_active (club_id, active),
    INDEX idx_cp_user_active (user_id, active)
);

-- 2. Seed All Official CampusNexus Clubs (ensuring sports and all student clubs are persistent)
INSERT INTO clubs (name, slug, description, category, logo_url, cover_url, contact_email, social_links, status)
VALUES
('Sports Club', 'sports-club', 'The college-wide athletic council driving intramural leagues, varsity selections, physical fitness bootcamps, and inter-collegiate tournaments.', 'SPORTS', '/images/clubs/sports.png', '/images/clubs/sports-cover.png', 'sports@mlrit.ac.in', '{"instagram": "https://instagram.com/sports_mlrit"}', 'ACTIVE'),
('CAME - Cultural Club', 'came', 'The premier college-wide creative arts, digital media, photography, and theatrical performances society open to all students across campus.', 'CULTURAL', '/images/clubs/cultural.png', '/images/clubs/cultural-cover.png', 'came@mlrit.ac.in', '{"instagram": "https://instagram.com/came_mlrit"}', 'ACTIVE'),
('EWB - Engineers Without Borders', 'ewb', 'Student-driven community engineering initiatives focusing on clean water, renewable energy, and sustainable village development.', 'SOCIAL', '/images/clubs/ewb.png', '/images/clubs/ewb-cover.png', 'ewb@mlrit.ac.in', '{"linkedin": "https://linkedin.com/company/ewb-mlrit"}', 'ACTIVE'),
('Apex - Robotics & Automation', 'apex', 'The premier student robotics and automated systems community designing autonomous bots, drones, and IoT hardware.', 'TECHNICAL', '/images/clubs/robotics.png', '/images/clubs/robotics-cover.png', 'apex@mlrit.ac.in', '{"linkedin": "https://linkedin.com/company/apex-mlrit"}', 'ACTIVE'),
('SCOPE - Coding Club', 'scope', 'Dedicated to competitive coding, algorithmic problem solving, Google Summer of Code mentorship, and system design.', 'TECHNICAL', '/images/clubs/coding.png', '/images/clubs/coding-cover.png', 'scope@mlrit.ac.in', '{"github": "https://github.com/mlrit"}', 'ACTIVE'),
('NSS - National Service Scheme', 'nss', 'The official institutional community outreach, disaster relief preparedness, social awareness, and civic volunteering wing.', 'SOCIAL', '/images/clubs/nss.png', '/images/clubs/nss-cover.png', 'nss@mlrit.ac.in', '{"instagram": "https://instagram.com/nss_mlrit"}', 'ACTIVE'),
('CIE - Innovation & Entrepreneurship', 'cie', 'The startup incubator, venture accelerator, and investor pitching cell empowering campus innovators and founders.', 'ACADEMIC', '/images/clubs/cie.png', '/images/clubs/cie-cover.png', 'cie@mlrit.ac.in', '{"linkedin": "https://linkedin.com/company/cie-mlrit"}', 'ACTIVE'),
('Club Literati & Debating Society', 'club-literati', 'The intellectual home for parliamentary debate, elocution, creative writing, poetry slams, and Model United Nations delegations.', 'LITERARY', '/images/clubs/literary.png', '/images/clubs/literary-cover.png', 'literati@mlrit.ac.in', '{"twitter": "https://twitter.com/literati_mlrit"}', 'ACTIVE'),
('CSI - Computer Society of India', 'csi', 'The premier technical society organizing national symposiums, hackathons, cloud certifications, and tech workshops.', 'TECHNICAL', '/images/clubs/csi.png', '/images/clubs/csi-cover.png', 'csi@mlrit.ac.in', '{"linkedin": "https://linkedin.com/company/csi-mlrit"}', 'ACTIVE')
ON DUPLICATE KEY UPDATE
    name=VALUES(name),
    description=VALUES(description),
    category=VALUES(category),
    contact_email=VALUES(contact_email),
    status=VALUES(status);
