/*
declaration:
  version: 0.1
  description: "Update the order of overview metrics for a user and insert the new metric at the specified ordinality"
  method: post
  namespace: auth_users
  returns: json
  accepts: json
  allowlist:
    body:
      - field: user_id_code
        type: string
        description: "Unique identifier for the user"
      - field: metric
        type: string
        description: "Name of the overview metric to reposition"
      - field: ordinality
        type: integer
        description: "Target position for the overview metric"
      - field: active
        type: boolean
        description: "Whether the overview metric is active"
  response:
    fields: []
*/
-- Query 1: Increment ordinality for metrics that need to shift up
-- (metrics with ordinality >= new position and < old position)
WITH
    old_value AS (
        SELECT ordinality
        FROM auth_users.user_overview_metric_preference
        WHERE
            user_id_code = :user_id_code
            AND metric = :metric::OVERVIEW_METRIC
        ORDER BY created DESC
        LIMIT 1
    ),

    metric_to_be_changed AS (
        SELECT
            u.id,
            ROW_NUMBER() OVER (
                PARTITION BY u.metric
                ORDER BY u.created DESC
            ) AS rn
        FROM auth_users.user_overview_metric_preference AS u
            CROSS JOIN old_value
        WHERE
            user_id_code = :user_id_code
            AND u.ordinality >= :ordinality
            AND u.ordinality < old_value.ordinality
            AND metric <> :metric::OVERVIEW_METRIC
    ),

    latest_metrics AS (
        SELECT id
        FROM metric_to_be_changed
        WHERE rn = 1
    )

INSERT INTO auth_users.user_overview_metric_preference (user_id_code, metric, ordinality, active)
SELECT
    user_id_code,
    metric,
    ordinality + 1,
    active
FROM auth_users.user_overview_metric_preference
WHERE id IN (SELECT id FROM latest_metrics);

-- Query 2: Decrement ordinality for metrics that need to shift down  
-- (metrics with ordinality > old position and <= new position)
WITH
    old_value AS (
        SELECT ordinality
        FROM auth_users.user_overview_metric_preference
        WHERE
            user_id_code = :user_id_code
            AND metric = :metric::OVERVIEW_METRIC
        ORDER BY created DESC
        LIMIT 1
    ),

    metric_to_be_changed AS (
        SELECT
            u.id,
            ROW_NUMBER() OVER (
                PARTITION BY u.metric
                ORDER BY u.created DESC
            ) AS rn
        FROM auth_users.user_overview_metric_preference AS u
            CROSS JOIN old_value
        WHERE
            user_id_code = :user_id_code
            AND u.ordinality > old_value.ordinality
            AND u.ordinality <= :ordinality
            AND metric <> :metric::OVERVIEW_METRIC
    ),

    latest_metrics AS (
        SELECT id
        FROM metric_to_be_changed
        WHERE rn = 1
    )

INSERT INTO auth_users.user_overview_metric_preference (user_id_code, metric, ordinality, active)
SELECT
    user_id_code,
    metric,
    ordinality - 1,
    active
FROM auth_users.user_overview_metric_preference
WHERE id IN (SELECT id FROM latest_metrics);

-- Query 3: Insert the new metric preference at the specified ordinality
INSERT INTO auth_users.user_overview_metric_preference (user_id_code, metric, ordinality, active)
VALUES (:user_id_code, :metric::OVERVIEW_METRIC, :ordinality, :active);
