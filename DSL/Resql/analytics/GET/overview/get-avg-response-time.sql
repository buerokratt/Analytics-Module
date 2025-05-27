WITH chat_responses AS (
    SELECT 
        dcm.chat_base_id,
        dcm.message_id,
        dcm.message_author_role,
        dcm.message_created,
        LAG(dcm.message_created) OVER (
            PARTITION BY dcm.chat_base_id
            ORDER BY dcm.message_created
        ) AS prev_created,
        LAG(dcm.message_author_role) OVER (
            PARTITION BY dcm.chat_base_id
            ORDER BY dcm.message_created
        ) AS prev_author
    FROM (
        -- Get the most recent version of each unique message
        SELECT DISTINCT ON (chat_base_id, message_id)
            chat_base_id,
            message_id,
            message_author_role,
            message_created,
            created
        FROM denormalized_chat_messages_for_metrics
        WHERE created IS NOT NULL
          AND created::date BETWEEN :start::date AND :end::date
        ORDER BY chat_base_id, message_id, timestamp DESC
    ) dcm
)
SELECT COALESCE(AVG(
        extract(
            epoch
            FROM (message_created - prev_created)
        )
    ), 0)
FROM chat_responses
WHERE message_author_role = 'chatbot'
    AND prev_author = 'end-user'