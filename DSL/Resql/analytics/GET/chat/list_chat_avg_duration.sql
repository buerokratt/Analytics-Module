WITH chat_durations AS (
    SELECT DISTINCT ON (chat_base_id)
        chat_base_id, 
        (last_message_timestamp - first_message_timestamp) AS duration,
        created
    FROM denormalized_chat_messages_for_metrics dcm
    WHERE chat_status = 'ENDED'
    AND created::date BETWEEN :start::date AND :end::date
    ORDER BY chat_base_id, timestamp DESC
)
SELECT 
    DATE_TRUNC(:period, created) AS time,
    ROUND(EXTRACT(epoch FROM COALESCE(AVG(duration), '0 minutes'::interval))/60) AS avg_duration
FROM chat_durations
GROUP BY time
ORDER BY time;