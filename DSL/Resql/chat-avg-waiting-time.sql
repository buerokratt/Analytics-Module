WITH user_messages AS (
    SELECT 
        chat_base_id, 
        author_role,
        created, 
        LAG(created) OVER (PARTITION BY chat_base_id, author_role ORDER BY created) AS prev_message_time
    FROM message
    WHERE author_role = 'end-user' 
    AND created::date BETWEEN :start::date AND :end::date
)
SELECT 
    DATE_TRUNC(:period, m.created) AS time, 
    AVG(EXTRACT(epoch FROM (m.created - prev_message_time))::integer / 60.0) AS average_waiting_time
FROM user_messages m
JOIN message byk
ON m.chat_base_id = byk.chat_base_id
AND byk.author_role = 'chatbot'
GROUP BY time
ORDER BY time
