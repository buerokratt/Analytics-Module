INSERT INTO scheduled_reports ("name", "period", metrics, dataset_id, start_date, end_date)
VALUES (:name, :period, array[ :metrics ], :dataset_id, :start_date, :end_date)
RETURNING id, name, dataset_id, period, metrics, created, updated, start_date, end_date, deleted;
