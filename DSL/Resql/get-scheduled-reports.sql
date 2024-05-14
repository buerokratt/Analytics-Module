WITH MaxReports AS (
  SELECT MAX(id) maxId
  FROM scheduled_reports
  GROUP BY dataset_id
)
SELECT *
FROM scheduled_reports
JOIN MaxReports on id = maxId
WHERE NOT deleted;
