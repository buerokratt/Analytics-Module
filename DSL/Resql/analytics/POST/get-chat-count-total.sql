SELECT COUNT(DISTINCT chat_base_id)
FROM (
    SELECT 
        chat_base_id
    FROM denormalized_chat_messages_for_metrics
    WHERE created::date BETWEEN :start::date AND :end::date
    GROUP BY chat_base_id
    HAVING 
        SUM(CASE WHEN message_author_role = 'end-user' THEN 1 ELSE 0 END) > 0
) AS eligible_chats;