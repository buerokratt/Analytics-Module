SELECT
    DATE_TRUNC(:period, created) AS time,
    COUNT(DISTINCT base_id)
FROM chat
WHERE (
    array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
   OR chat.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
    )
    AND chat.test = :showTest
    AND created::date BETWEEN :start::date AND :end::date
AND status = 'IDLE'
GROUP BY time
ORDER BY time
