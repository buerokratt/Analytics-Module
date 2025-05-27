WITH filtered_chats AS (
    SELECT 
        chat_base_id,
        date_trunc('month', ended) AS period_ended
    FROM denormalized_chat_messages_for_metrics
    WHERE ended >= date_trunc(:group_period, current_date - concat('1 ', :group_period)::INTERVAL)
    AND chat_base_id IN (
        SELECT DISTINCT chat_base_id
        FROM denormalized_chat_messages_for_metrics
        GROUP BY chat_base_id
        HAVING 
            SUM(CASE WHEN message_author_role = 'end-user' THEN 1 ELSE 0 END) > 0
            AND SUM(CASE WHEN message_author_role = 'backoffice-user' THEN 1 ELSE 0 END) = 0
            AND SUM(CASE WHEN message_author_role = 'buerokratt' THEN 1 ELSE 0 END) > 0
    )
    GROUP BY chat_base_id, date_trunc(:group_period, ended)
),
chat_counts AS (
    SELECT 
        period_ended,
        COUNT(DISTINCT chat_base_id) AS num_chats
    FROM filtered_chats
    GROUP BY period_ended
)
SELECT 
    timescale.ended AS ended,
    COALESCE(
        (SELECT num_chats FROM chat_counts WHERE period_ended = timescale.ended),
        0
    ) AS metric_value
FROM (
    SELECT 
        date_trunc(:group_period, generate_series(
            current_date - concat('1 ', :group_period)::INTERVAL,
            NOW(),
            concat('1 ', :group_period)::INTERVAL
        )) AS ended
) AS timescale
ORDER BY 1 DESC;
