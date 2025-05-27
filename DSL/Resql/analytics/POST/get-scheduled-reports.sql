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
FROM (
  SELECT 
    id,
    name,
    dataset_id,
    period,
    metrics,
    created,
    updated,
    start_date,
    end_date,
    ROW_NUMBER() OVER (PARTITION BY dataset_id ORDER BY id DESC) as rn
  FROM scheduled_reports
  WHERE NOT deleted
) ranked
WHERE rn = 1;