WITH chats AS (
    SELECT DISTINCT base_id
    FROM chat
    WHERE created BETWEEN :start::timestamptz AND :end::timestamptz
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
SELECT avg(
        extract(
            epoch
            FROM (created - prev_created)
        )
    )
FROM chat_responses
WHERE author_role = 'chatbot'
    AND prev_author = 'end-user'