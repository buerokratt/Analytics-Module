INSERT INTO scheduled_reports (name, period, metrics, dataset_id, start_date, end_date, deleted)
SELECT
  name,
  period,
  metrics,
  dataset_id,
  start_date,
  end_date,
  TRUE
FROM scheduled_reports
WHERE dataset_id = :id
ORDER BY id DESC
LIMIT 1;
