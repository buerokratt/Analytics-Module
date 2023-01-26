WITH chatbot_messages AS (
    SELECT 
        m.author_role, 
        m.created,
        m.chat_base_id,
        (
            SELECT MIN(created) 
            FROM message m2 
            WHERE m2.author_role <> 'chatbot' 
            AND m2.created < m.created 
            AND m2.chat_base_id = m.chat_base_id
        ) AS previous_message_time
    FROM message m
    JOIN chat c ON m.chat_base_id = c.base_id
    WHERE m.created BETWEEN :start::timestamptz AND :end::timestamptz
        AND m.author_role = 'chatbot'
),
aggregated_data AS (
    SELECT 
        DATE_TRUNC(:period,created) AS time,
        AVG(
            EXTRACT(EPOCH FROM created) - EXTRACT(EPOCH FROM previous_message_time)
        ) AS avg_response_time
    FROM chatbot_messages
    WHERE previous_message_time IS NOT NULL
    GROUP BY time
)
SELECT time, avg_response_time
FROM aggregated_data
ORDER BY time
