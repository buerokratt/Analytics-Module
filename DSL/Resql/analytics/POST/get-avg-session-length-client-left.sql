WITH chat_lengths AS (
    SELECT 
        chat_base_id,
        EXTRACT(EPOCH FROM (
            MAX(message_created) FILTER (
                WHERE message_event = 'client-left'
            ) -
            MIN(message_created)
        )) AS chat_length
    FROM (
        -- Get the most recent version of each unique message
        SELECT DISTINCT ON (chat_base_id, message_id)
            chat_base_id,
            message_id,
            message_event,
            message_created,
            message_author_role
        FROM denormalized_chat_messages_for_metrics
        WHERE created IS NOT NULL
          AND created::date BETWEEN :start::date AND :end::date
        ORDER BY chat_base_id, message_id, timestamp DESC
    ) dcm
    WHERE EXISTS (
        SELECT 1
        FROM denormalized_chat_messages_for_metrics dcm_inner
        WHERE dcm_inner.chat_base_id = dcm.chat_base_id
            AND dcm_inner.message_author_role = 'end-user'
    )
    GROUP BY chat_base_id
)
SELECT COALESCE(AVG(chat_length), 0)
FROM chat_lengths;