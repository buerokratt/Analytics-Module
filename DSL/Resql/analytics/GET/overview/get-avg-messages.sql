SELECT 
    COALESCE(AVG(message_count), 0) AS avg_messages_per_chat
FROM (
    SELECT 
        chat_base_id,
        COUNT(DISTINCT message_base_id) AS message_count
    FROM denormalized_chat_messages_for_metrics dcm
    WHERE created::date BETWEEN :start::date AND :end::date AND
    EXISTS (
            SELECT 1
            FROM denormalized_chat_messages_for_metrics inner_dcm
            WHERE inner_dcm.chat_base_id = dcm.chat_base_id
                AND inner_dcm.message_author_role = 'end-user'
        )
    GROUP BY chat_base_id
) AS chat_message_counts;