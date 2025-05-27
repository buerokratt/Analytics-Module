SELECT COUNT(DISTINCT chat_base_id)
FROM (
    SELECT 
        chat_base_id
    FROM denormalized_chat_messages_for_metrics
    WHERE created >= :start::date AND created < (:end::date + INTERVAL '1 day')
    GROUP BY chat_base_id
    HAVING 
        SUM(CASE WHEN message_author_role = 'end-user' THEN 1 ELSE 0 END) > 0
        AND SUM(CASE WHEN message_author_role = 'buerokratt' THEN 1 ELSE 0 END) > 0
        AND SUM(CASE WHEN message_author_role = 'backoffice-user' THEN 1 ELSE 0 END) = 0
) AS eligible_chats;