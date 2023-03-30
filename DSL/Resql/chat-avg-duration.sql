WITH chat_durations AS (
    SELECT 
        chat.base_id, 
        (MAX(message.created) - MIN(message.created)) AS duration,
        MIN(chat.created) AS created
    FROM chat
    JOIN message ON chat.base_id = message.chat_base_id
    WHERE chat.status = 'ENDED'
    AND chat.created BETWEEN :start::date AND :end::date
    GROUP BY chat.base_id
)
SELECT 
    DATE_TRUNC(:period, created) AS time,
    ROUND(EXTRACT(epoch FROM COALESCE(AVG(duration), '0 minutes'::interval))/60) AS avg_duration
FROM chat_durations
GROUP BY time
ORDER BY time
