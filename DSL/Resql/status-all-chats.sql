SELECT message.event AS event,
       COUNT(DISTINCT chat.base_id)
FROM chat JOIN message ON chat.base_id = message.chat_base_id
AND status = 'ENDED'
AND message.event IN (:events)
AND chat.created::date BETWEEN :start::date AND :end::date
GROUP BY event
ORDER BY event
