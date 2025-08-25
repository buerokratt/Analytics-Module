WITH filtered_chats AS (
    SELECT DISTINCT ON (c.base_id) c.base_id
FROM chat c
WHERE
    array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
   OR c.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
    ),
    waiting_times AS (
SELECT
    DATE_TRUNC(:period, m1.created)      AS time,
    m1.chat_base_id,
    (m2.created - m1.created)            AS waiting_time
FROM message m1
    JOIN filtered_chats fc
ON m1.chat_base_id = fc.base_id
    JOIN message m2
    ON m2.chat_base_id = m1.chat_base_id
    AND m2.author_role = 'backoffice-user'
    AND m2.created > m1.created
WHERE m1.author_role = 'end-user'
  AND m1.created::date BETWEEN :start::date AND :end::date
    )
SELECT
    time,
    ROUND(
    EXTRACT(
    epoch
    FROM PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY waiting_time)
    )::numeric / 60, 2) AS median_waiting_time
FROM waiting_times
GROUP BY time
ORDER BY time;