SELECT metric, ordinality, active
FROM (
  SELECT metric, ordinality, active,
         ROW_NUMBER() OVER (PARTITION BY metric ORDER BY id DESC) as rn
  FROM user_overview_metric_preference
  WHERE user_id_code = :user_id_code
) ranked
WHERE rn = 1
ORDER BY ordinality ASC;