WITH chats AS (
    SELECT DISTINCT base_id
    FROM chat
    WHERE created BETWEEN :start::timestamptz AND :end::timestamptz
)
SELECT ROUND(
        (
            1 - COUNT(*) filter (
                WHERE event = 'not-confident'
            )::numeric / COUNT(*)::numeric
        ) * 100,
        2
    ) AS pct_correctly_understood
FROM message
    JOIN chats ON message.chat_base_id = chats.base_id
WHERE author_role = 'chatbot';