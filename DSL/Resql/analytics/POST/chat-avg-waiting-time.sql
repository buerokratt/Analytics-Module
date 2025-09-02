WITH filtered_chats AS (
    SELECT DISTINCT ON (c.base_id) c.base_id
FROM chat c
WHERE
    (array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
   OR c.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
    )
  AND c.test = :showTest
,
    user_messages AS (
SELECT
    m.chat_base_id,
    m.created,
    LAG(m.created) OVER (
    PARTITION BY m.chat_base_id, m.author_role
    ORDER BY m.created
    ) AS prev_message_time
FROM message m
    JOIN filtered_chats fc
ON m.chat_base_id = fc.base_id
WHERE m.author_role = 'end-user'
  AND m.created::date BETWEEN :start::date AND :end::date
    ),
    average_waiting_time AS (
SELECT
    DATE_TRUNC(:period, um.created) AS time,
    COALESCE(
    AVG(
    EXTRACT(epoch FROM (um.created - um.prev_message_time))::integer
    / 60.0), 0) AS average_waiting_time
FROM user_messages um
    JOIN message byk
ON byk.chat_base_id = um.chat_base_id
    AND byk.author_role = 'backoffice-user'
GROUP BY time
    )
SELECT
    time,
    average_waiting_time
FROM average_waiting_time
ORDER BY time ASC;