WITH chat_stats AS (
    SELECT 
        chat_base_id,
        MAX(created) as created,
        MAX(last_message_timestamp - first_message_timestamp) AS duration
    FROM denormalized_chat_messages_for_metrics
    WHERE chat_status = 'ENDED'
    AND created >= :start::date AND created < (:end::date + INTERVAL '1 day')
    GROUP BY chat_base_id
)
SELECT
    DATE_TRUNC(:period, created) AS time,
    ROUND(EXTRACT(epoch FROM COALESCE(AVG(duration), '0 minutes'::interval))/60) AS avg_duration
FROM chat_stats
GROUP BY time
ORDER BY time;