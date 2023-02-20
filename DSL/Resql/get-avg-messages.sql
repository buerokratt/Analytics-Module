WITH chats AS (
    SELECT DISTINCT base_id
    FROM chat
    WHERE created::date BETWEEN :start::date AND :end::date
        AND EXISTS (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
                AND message.author_role = 'end-user'
        )
)
SELECT COALESCE(AVG(num_messages),0)
FROM (
        SELECT COUNT(DISTINCT base_id) AS num_messages
        FROM "message"
        WHERE chat_base_id IN (
                SELECT base_id
                FROM chats
            )
        GROUP BY chat_base_id
    ) AS msg_counts;
