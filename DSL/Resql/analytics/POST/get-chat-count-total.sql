SELECT COUNT(DISTINCT base_id)
FROM chat
WHERE (
        array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
            OR chat.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
        ) AND created::date BETWEEN :start::date AND :end::date
    AND exists (
        SELECT 1
        FROM message
        WHERE message.chat_base_id = chat.base_id
            AND message.author_role = 'end-user'
    )
