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
WITH OldValue AS(
  SELECT ordinality
  FROM user_overview_metric_preference
  WHERE user_id_code = :user_id_code
  AND metric = :metric::overview_metric
  ORDER BY id DESC
  LIMIT 1
),
MetricToBeChanged AS (
  SELECT MAX(id) AS maxId
  FROM user_overview_metric_preference AS u
  CROSS JOIN OldValue
  WHERE user_id_code = :user_id_code
  AND u.ordinality >= :ordinality
  AND u.ordinality < OldValue.ordinality
  AND metric <> :metric::overview_metric
  GROUP BY metric
)
INSERT INTO user_overview_metric_preference (user_id_code, metric, ordinality, active)
SELECT
  user_id_code,
  metric,
  ordinality + 1,
  active
FROM user_overview_metric_preference
JOIN MetricToBeChanged ON id = maxId;

WITH OldValue AS(
  SELECT ordinality
  FROM user_overview_metric_preference
  WHERE user_id_code = :user_id_code
  AND metric = :metric::overview_metric
  ORDER BY id DESC
  LIMIT 1
),
MetricToBeChanged AS (
  SELECT MAX(id) AS maxId
  FROM user_overview_metric_preference AS u
  CROSS JOIN OldValue
  WHERE user_id_code = :user_id_code
  AND u.ordinality > OldValue.ordinality
  AND u.ordinality <= :ordinality
  AND metric <> :metric::overview_metric
  GROUP BY metric
)
INSERT INTO user_overview_metric_preference (user_id_code, metric, ordinality, active)
SELECT
  user_id_code,
  metric,
  ordinality - 1,
  active
FROM user_overview_metric_preference
JOIN MetricToBeChanged ON id = maxId;

INSERT INTO user_overview_metric_preference (user_id_code, metric, ordinality, active)
VALUES (:user_id_code, :metric::overview_metric, :ordinality, :active);
