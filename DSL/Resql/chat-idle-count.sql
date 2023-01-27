SELECT
    DATE_TRUNC(:period, created) AS time,
    COUNT(DISTINCT base_id)
FROM chat
WHERE created BETWEEN :start::timestamptz AND :end::timestamptz
AND status = 'IDLE'
GROUP BY time
ORDER BY time
