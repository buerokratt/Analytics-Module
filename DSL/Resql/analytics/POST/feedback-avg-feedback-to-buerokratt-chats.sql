SELECT date_trunc(:metric, ended) AS date_time,
       ROUND(1.0 * SUM(CASE WHEN feedback_rating IS NOT NULL THEN feedback_rating ELSE 0 END) / NULLIF(COUNT(DISTINCT chat_base_id), 0), 1) AS avg
FROM denormalized_chat_messages_for_metrics chat
WHERE EXISTS
    (SELECT 1
     FROM denormalized_chat_messages_for_metrics message
     WHERE message.chat_base_id = chat.chat_base_id
       AND message.message_author_role = 'buerokratt' OR message.message_author_role = 'Bürokratt')
AND chat_status = 'ENDED'
AND ended::date BETWEEN :start::date AND :end::date
GROUP BY date_time
