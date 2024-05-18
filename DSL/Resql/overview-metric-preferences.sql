WITH MaxMetrics AS (
  SELECT MAX(id) AS maxId
  FROM user_overview_metric_preference
  WHERE user_id_code = :user_id_code
  GROUP BY metric
)
SELECT metric, ordinality, active
FROM user_overview_metric_preference
JOIN MaxMetrics ON id = maxId
ORDER BY "ordinality" ASC;
