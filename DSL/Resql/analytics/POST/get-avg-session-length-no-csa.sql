WITH chats AS (
    SELECT DISTINCT base_id,
                    ended
    FROM chat
    WHERE (
        array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
            OR chat.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
        )
      AND (
        :showTest = TRUE
            OR chat.test = FALSE
        )
        AND created::timestamptz BETWEEN :start::timestamptz AND :end::timestamptz
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
    SELECT EXTRACT(EPOCH FROM (MAX(chats.ended) - MIN(created))) AS chat_length
    FROM message
        JOIN chats ON message.chat_base_id = chats.base_id
    GROUP BY message.chat_base_id
)
SELECT COALESCE(AVG(chat_length), 0)
FROM chat_lengths;
