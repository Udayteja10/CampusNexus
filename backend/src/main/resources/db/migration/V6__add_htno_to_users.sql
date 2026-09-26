ALTER TABLE users
    ADD COLUMN htno VARCHAR(20) NULL,
    ADD CONSTRAINT uk_users_htno UNIQUE (htno);
