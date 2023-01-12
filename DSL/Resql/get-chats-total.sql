SELECT COUNT(distinct base_id)
FROM chat
WHERE created BETWEEN :start::timestamptz AND :end::timestamptz
    AND exists (
        SELECT 1
        FROM message
        WHERE message.chat_base_id = chat.base_id
            AND message.author_role = 'end-user'
    )