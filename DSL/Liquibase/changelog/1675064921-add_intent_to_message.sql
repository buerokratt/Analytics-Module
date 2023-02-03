-- liquibase formatted sql
-- changeset baha-a:1675064921

ALTER TABLE message
ADD COLUMN intent VARCHAR(50) NULL
