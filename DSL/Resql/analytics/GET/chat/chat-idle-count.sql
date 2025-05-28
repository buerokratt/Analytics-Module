SELECT
    DATE_TRUNC(:period, created) AS time,
    COUNT(DISTINCT base_id)
FROM chat
WHERE created >= :start::date AND created < (:end::date + INTERVAL '1 day')
AND status = 'IDLE'
GROUP BY time
ORDER BY time
