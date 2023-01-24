SELECT date_trunc(:metric, created) AS date_time,
       COUNT(DISTINCT base_id)
FROM chat
WHERE EXISTS
    (SELECT 1
     FROM message
     WHERE message.chat_base_id = chat.base_id
       AND message.event = 'client-left')
AND status = 'ENDED'
AND created::date BETWEEN :start::date AND :end::date
GROUP BY 1
