INSERT INTO scheduled_reports ("name", "period", metrics, cron_expression, dataset_id)
VALUES (:name, :period, :metrics, :cron_expression, :dataset_id);
