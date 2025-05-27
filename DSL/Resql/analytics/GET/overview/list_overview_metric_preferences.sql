/*
declaration:
  version: 0.1
  description: "Fetch the most recent overview metric preferences for a given user, ordered by ordinality"
  method: get
  namespace: overview
  returns: json
  allowlist:
    query:
      - field: user_id_code
        type: string
        description: "Unique identifier for the user whose metric preferences are being queried"
  response:
    fields:
      - field: metric
        type: string
        description: "Name of the metric"
      - field: ordinality
        type: number
        description: "Position of the metric in the user's preferred order"
      - field: active
        type: boolean
        description: "Indicates whether the metric is currently active for the user"
*/
SELECT metric, ordinality, active
FROM (
  SELECT metric, ordinality, active,
         ROW_NUMBER() OVER (PARTITION BY metric ORDER BY id DESC) as rn
  FROM user_overview_metric_preference
  WHERE user_id_code = :user_id_code
) ranked
WHERE rn = 1
ORDER BY ordinality ASC;