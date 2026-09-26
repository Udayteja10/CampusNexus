CREATE TABLE subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(150) NOT NULL,
    department_id BIGINT NOT NULL,
    semester INT NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_subjects_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT uk_subjects_dept_code UNIQUE (department_id, code)
);

CREATE TABLE academic_resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department_id BIGINT NOT NULL,
    subject_id BIGINT NULL,
    subject_code VARCHAR(30) NULL,
    subject_name VARCHAR(150) NULL,
    semester INT NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NULL,
    file_size BIGINT DEFAULT 0,
    uploader_id BIGINT NOT NULL,
    is_verified_by_coordinator BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by_id BIGINT NULL,
    verified_at TIMESTAMP NULL,
    downloads_count INT NOT NULL DEFAULT 0,
    upvotes_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_academic_resources_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT fk_academic_resources_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    CONSTRAINT fk_academic_resources_uploader FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_academic_resources_verifier FOREIGN KEY (verified_by_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE faculty (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    department_id BIGINT NOT NULL,
    email VARCHAR(150) NULL,
    cabin_location VARCHAR(100) NULL,
    office_hours VARCHAR(100) NULL,
    rating DOUBLE DEFAULT 0.0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_faculty_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

CREATE TABLE faculty_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    faculty_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    rating INT NOT NULL,
    comment TEXT,
    semester INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_faculty_reviews_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
    CONSTRAINT fk_faculty_reviews_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE study_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    department_id BIGINT NOT NULL,
    subject_code VARCHAR(30) NULL,
    subject_name VARCHAR(150) NULL,
    semester INT NOT NULL,
    leader_id BIGINT NOT NULL,
    members_count INT NOT NULL DEFAULT 1,
    max_members INT NOT NULL DEFAULT 10,
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    meeting_schedule VARCHAR(150) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_study_groups_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT fk_study_groups_leader FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE academic_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department_id BIGINT NOT NULL,
    subject_code VARCHAR(30) NULL,
    subject_name VARCHAR(150) NULL,
    semester INT NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    requester_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_academic_requests_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT fk_academic_requests_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE academic_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scope VARCHAR(20) NOT NULL,
    department_id BIGINT NULL,
    event_type VARCHAR(50) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    location VARCHAR(150) NULL,
    is_important BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_academic_events_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE wiki_articles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(150) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    content MEDIUMTEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    department_id BIGINT NULL,
    author_id BIGINT NOT NULL,
    views_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wiki_articles_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_wiki_articles_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
