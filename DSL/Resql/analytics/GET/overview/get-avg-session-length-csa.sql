WITH chat_durations AS (
    SELECT 
        chat_base_id,
        EXTRACT(EPOCH FROM (MAX(ended) - MIN(message_created))) AS chat_length
    FROM denormalized_chat_messages_for_metrics
    WHERE created IS NOT NULL
      AND created::date BETWEEN :start::date AND :end::date
    GROUP BY chat_base_id
    HAVING 
        MAX(ended) IS NOT NULL
        AND SUM(CASE WHEN message_author_role = 'backoffice-user' THEN 1 ELSE 0 END) > 0
        AND SUM(CASE WHEN message_author_role = 'end-user' THEN 1 ELSE 0 END) > 0
)
SELECT COALESCE(AVG(chat_length), 0) AS avg_chat_length
FROM chat_durations;