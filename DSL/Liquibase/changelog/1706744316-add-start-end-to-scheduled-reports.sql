-- liquibase formatted sql
-- changeset ahmedyasser:1706744316
ALTER TABLE scheduled_reports
ADD COLUMN start_date VARCHAR(150),
ADD COLUMN end_date VARCHAR(150);
