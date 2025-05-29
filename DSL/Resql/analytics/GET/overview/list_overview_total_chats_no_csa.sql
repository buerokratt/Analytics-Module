WITH filtered_chats AS (
   SELECT 
       chat_base_id,
       date_trunc('month', ended) AS period_ended
   FROM denormalized_chat_messages_for_metrics dcm
   WHERE ended >= date_trunc('month', current_date - concat('1 ', 'month')::INTERVAL)
   AND EXISTS (
       SELECT 1 
       FROM denormalized_chat_messages_for_metrics inner_dcm
       WHERE inner_dcm.chat_base_id = dcm.chat_base_id
       GROUP BY inner_dcm.chat_base_id
       HAVING 
           SUM(CASE WHEN inner_dcm.message_author_role = 'end-user' THEN 1 ELSE 0 END) > 0
           AND SUM(CASE WHEN inner_dcm.message_author_role = 'backoffice-user' THEN 1 ELSE 0 END) = 0
           AND SUM(CASE WHEN inner_dcm.message_author_role = 'buerokratt' THEN 1 ELSE 0 END) > 0
   )
   GROUP BY chat_base_id, date_trunc('month', ended)
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
   COALESCE(chat_counts.num_chats, 0) AS metric_value
FROM (
   SELECT 
       date_trunc('month', generate_series(
           current_date - concat('1 ', 'month')::INTERVAL,
           NOW(),
           concat('1 ', 'month')::INTERVAL
       )) AS ended
) AS timescale
LEFT JOIN chat_counts ON chat_counts.period_ended = timescale.ended
ORDER BY 1 DESC;