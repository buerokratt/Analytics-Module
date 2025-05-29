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
WITH OldValue AS(
  SELECT ordinality
  FROM user_overview_metric_preference
  WHERE user_id_code = :user_id_code
  AND metric = :metric::overview_metric
  ORDER BY created DESC
  LIMIT 1
),
MetricToBeChanged AS (
  SELECT 
    u.id,
    ROW_NUMBER() OVER (PARTITION BY u.metric ORDER BY u.created DESC) as rn
  FROM user_overview_metric_preference AS u
  CROSS JOIN OldValue
  WHERE user_id_code = :user_id_code
  AND u.ordinality >= :ordinality
  AND u.ordinality < OldValue.ordinality
  AND metric <> :metric::overview_metric
),
LatestMetrics AS (
  SELECT id
  FROM MetricToBeChanged
  WHERE rn = 1
)
INSERT INTO user_overview_metric_preference (user_id_code, metric, ordinality, active)
SELECT
  user_id_code,
  metric,
  ordinality + 1,
  active
FROM user_overview_metric_preference
WHERE id IN (SELECT id FROM LatestMetrics);

-- Query 2: Decrement ordinality for metrics that need to shift down  
-- (metrics with ordinality > old position and <= new position)
WITH OldValue AS(
  SELECT ordinality
  FROM user_overview_metric_preference
  WHERE user_id_code = :user_id_code
  AND metric = :metric::overview_metric
  ORDER BY created DESC
  LIMIT 1
),
MetricToBeChanged AS (
  SELECT 
    u.id,
    ROW_NUMBER() OVER (PARTITION BY u.metric ORDER BY u.created DESC) as rn
  FROM user_overview_metric_preference AS u
  CROSS JOIN OldValue
  WHERE user_id_code = :user_id_code
  AND u.ordinality > OldValue.ordinality
  AND u.ordinality <= :ordinality
  AND metric <> :metric::overview_metric
),
LatestMetrics AS (
  SELECT id
  FROM MetricToBeChanged
  WHERE rn = 1
)
INSERT INTO user_overview_metric_preference (user_id_code, metric, ordinality, active)
SELECT
  user_id_code,
  metric,
  ordinality - 1,
  active
FROM user_overview_metric_preference
WHERE id IN (SELECT id FROM LatestMetrics);

-- Query 3: Insert the new metric preference at the specified ordinality
INSERT INTO user_overview_metric_preference (user_id_code, metric, ordinality, active)
VALUES (:user_id_code, :metric::overview_metric, :ordinality, :active);