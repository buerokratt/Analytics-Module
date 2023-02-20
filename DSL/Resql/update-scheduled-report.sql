UPDATE scheduled_reports
SET (
        "name" = :name,
        "period" = :period,
        cron_expression = :cron_expression
    )
WHERE id = :id;
