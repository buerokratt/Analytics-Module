SELECT date_trunc(:metric, created) AS date_time,
       ROUND(1.0 * SUM(CASE WHEN feedback_rating IS NOT NULL THEN 1 ELSE 0 END) / COUNT(DISTINCT base_id), 1) AS avg
FROM chat
WHERE EXISTS
    (SELECT 1
     FROM message
     WHERE message.chat_base_id = chat.base_id
       AND message.author_role = 'chatbot')
AND status = 'ENDED'
AND created::date BETWEEN :start::date AND :end::date
GROUP BY date_time
