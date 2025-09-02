WITH filtered_chats AS (
    SELECT DISTINCT ON (c.base_id)
    c.base_id
FROM chat c
WHERE (
    array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
   OR c.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
    )
  AND c.test = :showTest
ORDER BY c.base_id, c.created DESC
    ),
    counts AS (
SELECT
    m.chat_base_id,
    COUNT(*)      AS num_of_messages,
    MIN(m.created) AS created
FROM message m
    JOIN filtered_chats fc
ON m.chat_base_id = fc.base_id
WHERE m.created::date BETWEEN :start::date AND :end::date
GROUP BY m.chat_base_id
    )
SELECT
    DATE_TRUNC(:period, created)   AS time,
  AVG(num_of_messages)           AS avg_num_of_messages
FROM counts
GROUP BY time
ORDER BY time;