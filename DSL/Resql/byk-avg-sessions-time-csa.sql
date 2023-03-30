WITH closed_chats AS (
    SELECT
        chat_base_id,
        (MAX(m.created) - MIN(m.created)) AS duration,
        MIN(chat.created) AS created
    FROM message m
    JOIN chat ON m.chat_base_id = chat.base_id
    WHERE chat.status = 'ENDED'
    AND EXISTS (
      SELECT 1
      FROM message m2
      WHERE m.chat_base_id = m2.chat_base_id
      AND m2.author_role = 'backoffice-user'
    )
    AND chat.created BETWEEN :start::date AND :end::date
    GROUP BY chat_base_id
)
SELECT
    DATE_TRUNC(:period, created) AS time,
    ROUND(EXTRACT(epoch FROM COALESCE(AVG(duration), '0 minutes'::interval))/60) AS avg_sesssion_time
FROM closed_chats
GROUP BY time
ORDER BY time
