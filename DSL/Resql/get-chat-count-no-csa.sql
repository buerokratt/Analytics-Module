SELECT COUNT(DISTINCT base_id)
FROM chat
WHERE created::date BETWEEN :start::date AND :end::date
    AND EXISTS (
        SELECT 1
        FROM message
        WHERE message.chat_base_id = chat.base_id
            AND message.author_role = 'end-user'
    )
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
            AND message.author_role = 'chatbot'
    )
