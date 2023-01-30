SELECT
    DATE_TRUNC(:period, created) AS time,
    COUNT(DISTINCT base_id)
FROM chat
WHERE created BETWEEN :start::date AND :end::date
AND status = 'IDLE'
GROUP BY time
ORDER BY time
