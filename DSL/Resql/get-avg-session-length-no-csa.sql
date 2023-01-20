WITH chats AS (
    SELECT base_id,
        ended
    FROM chat
    WHERE created BETWEEN :start::timestamptz AND :end::timestamptz
        AND NOT EXISTS (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
                AND message.author_role = 'backoffice-user'
        )
        AND EXISTS (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
                AND message.author_role = 'end-user'
        )
        AND EXISTS (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
                AND message.author_role = 'chatbot'
        )
        AND ended IS NOT NULL
    GROUP BY base_id,
        ended
),
chat_lengths AS (
    SELECT age(MAX(chats.ended), MIN(created)) AS chat_length
    FROM message
        JOIN chats ON message.chat_base_id = chats.base_id
    GROUP BY message.chat_base_id
)
SELECT COALESCE(AVG(chat_length), '0 seconds'::interval)
FROM chat_lengths;
