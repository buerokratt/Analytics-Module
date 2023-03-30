WITH closed_chats AS (
    SELECT
        chat_base_id,
        (MAX(m.created) - MIN(m.created)) AS duration,
        MIN(chat.created) AS created
    FROM message m
    JOIN chat ON m.chat_base_id = chat.base_id
    WHERE m.event IN ('answered', 'client-left')
    AND chat.created BETWEEN :start::date AND :end::date
    GROUP BY chat_base_id
)
SELECT
    DATE_TRUNC(:period, created) AS time,
    ROUND(EXTRACT(epoch FROM COALESCE(AVG(duration), '0 minutes'::interval))/60) AS avg_sesssion_time
FROM closed_chats
GROUP BY time
ORDER BY time
