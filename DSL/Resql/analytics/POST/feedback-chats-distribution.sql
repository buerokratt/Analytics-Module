WITH chats_filtered AS (
    SELECT DISTINCT ON (chat_base_id, feedback_rating)
        chat_base_id AS base_id,
        created,
        feedback_rating
    FROM denormalized_chat_messages_for_metrics
    WHERE chat_status = 'ENDED'
        AND feedback_rating IS NOT NULL
        AND created::date BETWEEN :start::date AND :end::date
        AND (
            (:chat_type = 'buerokratt' AND EXISTS (
                SELECT 1 
                FROM denormalized_chat_messages_for_metrics dcm_inner
                WHERE dcm_inner.chat_base_id = denormalized_chat_messages_for_metrics.chat_base_id 
                AND dcm_inner.message_author_role = 'buerokratt'
            ))
            OR 
            (:chat_type = 'csa' AND customer_support_id <> ''
                AND EXISTS (
                    SELECT 1 
                    FROM denormalized_chat_messages_for_metrics dcm_inner
                    WHERE dcm_inner.chat_base_id = denormalized_chat_messages_for_metrics.chat_base_id
                    AND dcm_inner.message_author_role = 'backoffice-user'
                )
                AND EXISTS (
                    SELECT 1 
                    FROM denormalized_chat_messages_for_metrics dcm_inner
                    WHERE dcm_inner.chat_base_id = denormalized_chat_messages_for_metrics.chat_base_id
                    AND dcm_inner.message_author_role = 'end-user'
                )
            )
        )
    ORDER BY chat_base_id, feedback_rating, timestamp DESC
)
SELECT 
    COUNT(CASE WHEN feedback_rating BETWEEN 9 AND 10 THEN 1 END) AS promoters,
    COUNT(CASE WHEN feedback_rating BETWEEN 7 AND 8 THEN 1 END) AS passives,
    COUNT(CASE WHEN feedback_rating BETWEEN 0 AND 6 THEN 1 END) AS detractors
FROM chats_filtered;