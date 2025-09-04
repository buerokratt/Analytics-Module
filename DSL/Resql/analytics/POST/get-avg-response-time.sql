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
      AND created::date BETWEEN :start::date AND :end::date
),
chat_responses AS (
    SELECT chat_base_id,
        author_role,
        message.created,
        LAG(message.created) OVER (
            PARTITION BY chat_base_id
            ORDER BY message.created
        ) AS prev_created,
        LAG(author_role) OVER (
            PARTITION BY chat_base_id
            ORDER BY created
        ) AS prev_author
    FROM message
        JOIN chats ON message.chat_base_id = chats.base_id
)
SELECT COALESCE(AVG(
        extract(
            epoch
            FROM (created - prev_created)
        )
    ), 0)
FROM chat_responses
WHERE author_role = 'chatbot'
    AND prev_author = 'end-user'
