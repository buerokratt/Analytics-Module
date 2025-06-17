-- liquibase formatted sql
-- changeset ahmer-mt:20250617122155 ignore:true
CREATE OR REPLACE FUNCTION set_user_overview_metric_defaults() RETURNS TRIGGER AS $$
DECLARE BEGIN
INSERT INTO auth_users.user_overview_metric_preference (user_id_code, metric, "ordinality", active)
SELECT new.id_code,
    metric,
    "ordinality",
    "ordinality" <= 6
FROM unnest(enum_range(NULL::overview_metric)) WITH ORDINALITY metric;
RETURN new;
END;
$$ language plpgsql;