-- liquibase formatted sql
-- changeset gertdrui:1676271876
ALTER TABLE public."configuration"
ALTER COLUMN "value" TYPE varchar(300) USING value::varchar;
