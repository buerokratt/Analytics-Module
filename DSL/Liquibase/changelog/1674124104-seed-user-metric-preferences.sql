-- liquibase formatted sql
-- changeset gertdrui:1674124104
INSERT INTO user_overview_metric_preference (user_id_code, metric, ordinality, active)
SELECT DISTINCT "user".id_code,
    metric,
    "ordinality",
    "ordinality" <= 6
FROM unnest(enum_range(NULL::overview_metric)) WITH ordinality metric
    CROSS JOIN "user";
