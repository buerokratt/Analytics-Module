SELECT 
    CASE
        WHEN (:period = 'day') THEN date_trunc('day', NOW() - INTERVAL '1 day')
        WHEN (:period = 'week') THEN date_trunc('week', NOW() - INTERVAL '1 week')
        WHEN (:period = 'month') THEN date_trunc('month', NOW() - INTERVAL '1 month')
        WHEN (:period = 'quarter') THEN date_trunc('quarter', NOW() - INTERVAL '3 month')
        WHEN (:period = 'year') THEN date_trunc('year', NOW() - INTERVAL '1 year')
        WHEN (:period = 'never') THEN date_trunc('day', :start::date)
    END AS "start",
    CASE
        WHEN (:period = 'day') THEN date_trunc('day', NOW()) - INTERVAL '1 day'
        WHEN (:period = 'week') THEN date_trunc('week', NOW()) - INTERVAL '1 day'
        WHEN (:period = 'month') THEN date_trunc('month', NOW()) - INTERVAL '1 day'
        WHEN (:period = 'quarter') THEN date_trunc('quarter', NOW()) - INTERVAL '1 day'
        WHEN (:period = 'year') THEN date_trunc('year', NOW()) - INTERVAL '1 day'
        WHEN (:period = 'never') THEN date_trunc('day', :end::date)
    END AS "end"
