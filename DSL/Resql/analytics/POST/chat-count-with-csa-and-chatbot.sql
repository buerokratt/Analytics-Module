SELECT 
    DATE_TRUNC(:period, ended) AS time,
    COUNT(DISTINCT chat_base_id) AS sum_count
FROM (
    SELECT DISTINCT ON (chat_base_id)
        chat_base_id,
        ended
    FROM denormalized_chat_messages_for_metrics
    WHERE ended::date BETWEEN :start::date AND :end::date 
    AND chat_status = 'ENDED'
    AND (
        (
            NOT EXISTS (
                SELECT 1
                FROM denormalized_chat_messages_for_metrics m1
                WHERE m1.chat_base_id = denormalized_chat_messages_for_metrics.chat_base_id
                AND m1.message_author_role = 'backoffice-user'
            )
            AND NOT EXISTS (
                SELECT 1
                FROM denormalized_chat_messages_for_metrics m2
                WHERE m2.chat_base_id = denormalized_chat_messages_for_metrics.chat_base_id
                AND m2.message_event = 'taken-over'
            )
        )
        OR
        (
            EXISTS (
                SELECT 1
                FROM denormalized_chat_messages_for_metrics m3
                WHERE m3.chat_base_id = denormalized_chat_messages_for_metrics.chat_base_id
                AND m3.message_author_role = 'backoffice-user'
            )
            AND EXISTS (
                SELECT 1
                FROM denormalized_chat_messages_for_metrics m4
                WHERE m4.chat_base_id = denormalized_chat_messages_for_metrics.chat_base_id
                AND m4.message_event = 'taken-over'
            )
        )
    )
    ORDER BY chat_base_id, timestamp DESC
) AS filtered_chats
GROUP BY time
ORDER BY time ASC;