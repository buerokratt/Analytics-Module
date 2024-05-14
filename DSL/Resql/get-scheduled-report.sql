SELECT *
FROM scheduled_reports
WHERE dataset_id = :datasetId
ORDER BY id DESC
LIMIT 1;
