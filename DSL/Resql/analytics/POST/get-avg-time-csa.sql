WITH chats AS (
    SELECT DISTINCT base_id
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
        AND EXISTS (
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
),
chat_lengths AS (
    SELECT EXTRACT(EPOCH FROM (MAX(created) - MIN(created))) AS chat_length
    FROM message
        JOIN chats ON message.chat_base_id = chats.base_id
    GROUP BY message.chat_base_id
)
SELECT COALESCE(AVG(chat_length), 0)
FROM chat_lengths;
