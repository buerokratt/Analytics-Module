WITH MaxReports AS (
  SELECT MAX(id) maxId
  FROM scheduled_reports
  GROUP BY dataset_id
)
SELECT 
  id,
  name,
  dataset_id,
  period,
  metrics,
  created,
  updated,
  start_date,
  end_date
FROM scheduled_reports
JOIN MaxReports on id = maxId
WHERE NOT deleted;
