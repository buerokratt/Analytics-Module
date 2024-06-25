-- liquibase formatted sql
-- changeset baha-a:1715604012
ALTER TABLE scheduled_reports
ADD COLUMN IF NOT EXISTS deleted boolean NOT NULL DEFAULT FALSE;
