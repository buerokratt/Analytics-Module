WITH latest_per_base AS (
    SELECT DISTINCT ON (c.base_id) c.*
FROM chat c
WHERE (
    array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
   OR c.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
    )
ORDER BY c.base_id, c.updated DESC
    ),
    filtered_chats AS (
SELECT lp.*
FROM latest_per_base lp
WHERE lp.status = 'IDLE'
  AND (:showTest = TRUE OR lp.test = FALSE)
  AND lp.created::timestamptz BETWEEN :start::timestamptz AND :end::timestamptz
    )
SELECT
    DATE_TRUNC(:period, fc.created) AS time,
    COUNT(DISTINCT fc.base_id) AS count
FROM filtered_chats fc
GROUP BY time
ORDER BY time;
