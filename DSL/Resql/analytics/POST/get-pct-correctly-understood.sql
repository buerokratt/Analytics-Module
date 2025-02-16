WITH chats AS (
    SELECT DISTINCT base_id
    FROM chat
    WHERE created::date BETWEEN :start::date AND :end::date
)
SELECT CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(
            (
                1 - COUNT(*) filter (
                    WHERE event = 'not-confident'
                )::numeric / COUNT(*)::numeric
            ) * 100,
            2
        )
    END AS pct_correctly_understood
FROM message
    JOIN chats ON message.chat_base_id = chats.base_id
WHERE author_role = 'chatbot';
