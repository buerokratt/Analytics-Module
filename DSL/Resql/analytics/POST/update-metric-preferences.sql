WITH
    preference_list AS (
        SELECT
            (:user_id_code)::text AS user_id_code,
            (pref->>'metric') AS metric,
            (pref->>'ordinality')::int AS ordinality,
            (pref->>'active')::boolean AS active
        FROM jsonb_array_elements(:preferences::jsonb) AS pref
    ),
    last_preferences AS (
        SELECT
            p.user_id_code,
            p.metric,
            p.ordinality,
            p.active
        FROM user_overview_metric_preference AS p
        WHERE p.user_id_code = :user_id_code
          AND p.id = (
            SELECT MAX(id)
            FROM user_overview_metric_preference AS p2
            WHERE p2.user_id_code = p.user_id_code
              AND p2.metric = p.metric
        )
    )
INSERT INTO user_overview_metric_preference (user_id_code, metric, ordinality, active)
SELECT
    pl.user_id_code,
    pl.metric,
    pl.ordinality,
    pl.active
FROM preference_list AS pl
         LEFT JOIN last_preferences AS lp
                   ON lp.user_id_code = pl.user_id_code
                       AND lp.metric = pl.metric
WHERE
    pl.ordinality IS DISTINCT FROM lp.ordinality
    OR pl.active IS DISTINCT FROM lp.active
    RETURNING user_id_code, metric, ordinality, active;
