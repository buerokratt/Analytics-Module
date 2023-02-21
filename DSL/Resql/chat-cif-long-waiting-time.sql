WITH user_messages AS (
    SELECT 
        chat_base_id, 
        created, 
        LAG(created) OVER (PARTITION BY chat_base_id, author_role ORDER BY created) AS prev_message_time
    FROM message
    WHERE author_role = 'end-user' 
),
waiting_times AS(
    SELECT
        m.chat_base_id AS chat_base_id,
        MIN(m.created) AS created, 
        EXTRACT(epoch FROM MAX(m.created - prev_message_time))::INT AS waiting_time_seconds
    FROM user_messages m
    JOIN message ms
    ON m.chat_base_id = ms.chat_base_id
    AND ms.author_role = 'backoffice-user'
    WHERE prev_message_time IS NOT NULL
    GROUP BY m.chat_base_id
)
SELECT 
    DATE_TRUNC(:period, created) AS time, 
    COUNT(*) AS long_waiting_time
FROM waiting_times
WHERE created BETWEEN :start::date AND :end::date
AND waiting_time_seconds > :threshold_seconds
GROUP BY time
ORDER BY time
