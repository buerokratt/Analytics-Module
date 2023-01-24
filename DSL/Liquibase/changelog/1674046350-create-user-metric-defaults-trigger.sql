-- liquibase formatted sql
-- changeset gertdrui:1674046350 splitStatements:false
CREATE OR REPLACE FUNCTION set_user_overview_metric_defaults() RETURNS TRIGGER AS $$
DECLARE BEGIN
INSERT INTO user_overview_metric_preference (user_id_code, metric, "ordinality", active)
SELECT new.id_code,
    metric,
    "ordinality",
    "ordinality" <= 6
FROM unnest(enum_range(NULL::overview_metric)) WITH ORDINALITY metric;
RETURN new;
END;
$$ language plpgsql;

CREATE TRIGGER overview_metric_defaults_on_user_insert
AFTER
INSERT ON "user" FOR each ROW EXECUTE PROCEDURE set_user_overview_metric_defaults();
