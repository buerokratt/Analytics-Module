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
WHERE dataset_id = :datasetId
ORDER BY id DESC
LIMIT 1;
