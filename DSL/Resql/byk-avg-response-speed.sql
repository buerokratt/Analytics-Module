WITH chatbot_messages AS (
    SELECT
        created,
        (
            SELECT MAX(created) 
            FROM message m2 
            WHERE m2.author_role <> 'chatbot' 
            AND m2.created < m.created 
            AND m2.chat_base_id = m.chat_base_id
        ) AS previous_message_time
    FROM message m
    WHERE created BETWEEN :start::date AND :end::date
    AND author_role = 'chatbot'
)
SELECT 
    DATE_TRUNC(:period, created) AS time,
    AVG(
        EXTRACT(EPOCH FROM created) - EXTRACT(EPOCH FROM previous_message_time)
    ) AS avg_response_time
FROM chatbot_messages
WHERE previous_message_time IS NOT NULL
GROUP BY time
ORDER BY time
