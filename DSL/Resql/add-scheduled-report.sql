INSERT INTO scheduled_reports (job_id, "name", "period", metrics, dataset_id)
VALUES (:job_id, :name, :period, array[ :metrics ], :dataset_id);
