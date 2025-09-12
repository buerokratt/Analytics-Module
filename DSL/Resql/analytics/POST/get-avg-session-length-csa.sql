WITH chats AS (
    SELECT base_id,
           ended,
           created
    FROM chat
    WHERE (
        array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
            OR chat.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
        )
      AND (
        :showTest = TRUE
            OR chat.test = FALSE
        )
      AND created::date BETWEEN :start::date AND :end::date
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
                                   AND ended IS NOT NULL
    ),
    chat_lengths AS (
SELECT EXTRACT(EPOCH FROM (MAX(ended) - MIN(created))) AS chat_length
FROM chats
GROUP BY base_id
    )
SELECT COALESCE(AVG(chat_length), 0) AS avg_chat_length_seconds
FROM chat_lengths;