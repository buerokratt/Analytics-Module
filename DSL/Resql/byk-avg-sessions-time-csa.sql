WITH closed_chats AS (
    SELECT
        chat_base_id,
        MIN(m.created) AS start_time,
        MAX(m.created) AS end_time
    FROM message m
    JOIN chat ON m.chat_base_id = chat.base_id
    WHERE chat.status = 'ENDED'
    AND EXISTS (
      SELECT 1
      FROM message m2
      WHERE m.chat_base_id = m2.chat_base_id
      AND m2.author_role = 'backoffice-user'
    )
    AND chat.created BETWEEN :start::timestamptz AND :end::timestamptz
    GROUP BY chat_base_id
)
SELECT
    DATE_TRUNC(:period, start_time) AS time,
    AVG(EXTRACT(EPOCH FROM end_time - start_time)) AS avg_sesssion_time
FROM closed_chats
GROUP BY time
ORDER BY time;