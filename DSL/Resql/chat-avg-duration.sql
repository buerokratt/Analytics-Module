WITH chat_durations AS (
    SELECT 
        chat.base_id, 
        (MAX(message.created) - MIN(message.created)) AS duration,
        MIN(chat.created) AS created
    FROM chat
    JOIN message ON chat.base_id = message.chat_base_id
    WHERE chat.status = 'ENDED'
    AND message.created BETWEEN :start::timestamptz AND :end::timestamptz
    GROUP BY chat.base_id
)
SELECT 
    DATE_TRUNC(:period, created) AS time,
    AVG(duration) AS avg_duration
FROM chat_durations
GROUP BY time
ORDER BY time;
