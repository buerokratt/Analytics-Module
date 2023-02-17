WITH closed_chats AS (
    SELECT
        chat_base_id,
        MIN(m.created) AS start_time,
        MAX(m.created) AS end_time
    FROM message m
    JOIN chat ON m.chat_base_id = chat.base_id
    WHERE m.event IN ('answered', 'client-left')
    AND chat.created BETWEEN :start::date AND :end::date
    GROUP BY chat_base_id
)
SELECT
    DATE_TRUNC(:period, start_time) AS time,
    AVG(EXTRACT(EPOCH FROM end_time - start_time)) AS avg_sesssion_time
FROM closed_chats
GROUP BY time
ORDER BY time
