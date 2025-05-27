WITH ended_chats AS (
    SELECT DISTINCT ON (chat_base_id)
        chat_base_id,
        ended
    FROM denormalized_chat_messages_for_metrics
    WHERE ended::date BETWEEN :start::date AND :end::date
    AND chat_status = 'ENDED'
    AND NOT EXISTS (
        SELECT 1
        FROM denormalized_chat_messages_for_metrics dcm_inner
        WHERE dcm_inner.chat_base_id = denormalized_chat_messages_for_metrics.chat_base_id
        AND dcm_inner.message_author_role = 'backoffice-user'
    )
    AND NOT EXISTS (
        SELECT 1
        FROM denormalized_chat_messages_for_metrics dcm_inner
        WHERE dcm_inner.chat_base_id = denormalized_chat_messages_for_metrics.chat_base_id
        AND dcm_inner.message_event = 'taken-over'
    )
    ORDER BY chat_base_id, timestamp DESC
)
SELECT 
    DATE_TRUNC(:period, ended) AS time,
    COUNT(DISTINCT chat_base_id) AS count
FROM ended_chats
GROUP BY time
ORDER BY time;
