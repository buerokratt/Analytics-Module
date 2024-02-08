INSERT INTO scheduled_reports ("name", "period", metrics, dataset_id, start_date, end_date)
VALUES (:name, :period, array[ :metrics ], :dataset_id, :start_date, :end_date)
RETURNING *;
