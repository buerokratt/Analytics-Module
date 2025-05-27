WITH filtered_chats AS (
    SELECT 
        chat_base_id,
        MAX(ended) as max_ended
    FROM denormalized_chat_messages_for_metrics
    GROUP BY chat_base_id
    HAVING 
        MAX(CASE WHEN message_author_role = 'end-user' THEN 1 ELSE 0 END) > 0
        AND MAX(ended) >= date_trunc(:group_period, current_date - concat('1 ', :group_period)::INTERVAL)
),
daily_chat_counts AS (
    SELECT 
        date_trunc('day', max_ended) AS ended_day,
        COUNT(DISTINCT chat_base_id) AS num_chats
    FROM filtered_chats
    GROUP BY date_trunc('day', max_ended)
)
SELECT 
    date_trunc(:group_period, timescale.ended) AS ended,
    ROUND(AVG(COALESCE(num_chats, 0))) AS metric_value
FROM (
    SELECT 
        date_trunc('day', generate_series(
            date_trunc(:group_period, current_date - concat('1 ', :group_period)::INTERVAL),
            NOW(),
            '1 day'::INTERVAL
        )) AS ended
) AS timescale
LEFT JOIN daily_chat_counts ON daily_chat_counts.ended_day = timescale.ended
GROUP BY 1
ORDER BY 1 DESC;