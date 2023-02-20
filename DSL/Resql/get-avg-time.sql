WITH chats AS (
    SELECT DISTINCT chat.base_id
    FROM chat
    WHERE created::date BETWEEN :start::date AND :end::date
        AND EXISTS (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
                AND message.author_role = 'end-user'
        )
),
chat_lengths AS (
    SELECT EXTRACT(EPOCH FROM (MAX(created) - MIN(created))) AS chat_length
    FROM message
        JOIN chats ON message.chat_base_id = chats.base_id
    GROUP BY message.chat_base_id
)
SELECT COALESCE(AVG(chat_length), 0)
FROM chat_lengths;
