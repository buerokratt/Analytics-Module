WITH chatbot_messages AS (
    SELECT DISTINCT ON (message_id)
        message_event
    FROM denormalized_chat_messages_for_metrics
    WHERE message_author_role = 'chatbot'
      AND created IS NOT NULL AND created::date BETWEEN :start::date AND :end::date
    ORDER BY message_id, timestamp DESC
)
SELECT 
    CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(
            (1 - COUNT(*) FILTER (WHERE message_event = 'not-confident')::numeric / COUNT(*)::numeric) * 100,
            2
        )
    END AS pct_correctly_understood
FROM chatbot_messages;