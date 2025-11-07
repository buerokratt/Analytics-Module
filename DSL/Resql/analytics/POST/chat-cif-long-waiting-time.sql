WITH latest_per_base AS (
    SELECT DISTINCT ON (c.base_id) c.*
FROM chat c
WHERE (
    array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
   OR c.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
    )
ORDER BY c.base_id, c.updated DESC
    ),
    user_messages AS (
SELECT
    m.chat_base_id,
    m.created,
    LAG(m.created) OVER (PARTITION BY m.chat_base_id, m.author_role ORDER BY m.created) AS prev_message_time
FROM message m
WHERE m.author_role = 'end-user'
    ),
    waiting_times AS (
SELECT
    m.chat_base_id,
    MIN(m.created) AS created,
    EXTRACT(epoch FROM MAX(m.created - m.prev_message_time))::INT AS waiting_time_seconds
FROM user_messages m
    JOIN message ms
ON m.chat_base_id = ms.chat_base_id
    AND ms.author_role = 'backoffice-user'
WHERE m.prev_message_time IS NOT NULL
GROUP BY m.chat_base_id
    )
SELECT
    DATE_TRUNC(:period, w.created) AS time,
    COUNT(*) AS long_waiting_time
FROM waiting_times w
    JOIN latest_per_base lp
ON lp.base_id = w.chat_base_id
WHERE w.created::timestamptz BETWEEN :start::timestamptz AND :end::timestamptz
  AND w.waiting_time_seconds > :threshold_seconds
  AND (:showTest = TRUE OR lp.test = FALSE)
  AND (
      EXISTS (
          SELECT 1
          FROM message m
          WHERE m.chat_base_id = lp.base_id
            AND m.event LIKE '%contact-information-fulfilled'
      )
      OR lp.end_user_email IS NOT NULL AND lp.end_user_email <> ''
      OR lp.end_user_phone IS NOT NULL AND lp.end_user_phone <> ''
  )
GROUP BY time
ORDER BY time;
