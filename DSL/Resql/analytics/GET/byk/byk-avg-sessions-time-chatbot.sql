WITH closed_chats AS (
    SELECT DISTINCT ON (chat_base_id)
        chat_base_id,
        created,
        (last_message_timestamp - first_message_timestamp) AS duration
    FROM denormalized_chat_messages_for_metrics dcm
    WHERE EXISTS (
        SELECT 1
        FROM denormalized_chat_messages_for_metrics dcm_inner
        WHERE dcm.chat_base_id = dcm_inner.chat_base_id
        AND dcm_inner.chat_status IN ('ENDED', 'IDLE')
    )
    AND NOT EXISTS (
        SELECT 1
        FROM denormalized_chat_messages_for_metrics dcm_inner
        WHERE dcm.chat_base_id = dcm_inner.chat_base_id
        AND dcm_inner.message_author_role = 'backoffice-user'
    )
    WHERE created::date BETWEEN :start::date AND :end::date
    ORDER BY chat_base_id, timestamp DESC
)
SELECT
    DATE_TRUNC(:period, created) AS time,
    ROUND(EXTRACT(epoch FROM COALESCE(AVG(duration), '0 minutes'::interval))/60) AS avg_sesssion_time
FROM closed_chats
GROUP BY time
ORDER BY time;