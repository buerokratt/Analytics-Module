SELECT date_trunc(:metric, chat.ended) AS date_time, message.event AS event,
       COUNT(DISTINCT chat.base_id)
FROM chat JOIN message ON chat.base_id = message.chat_base_id
AND status = 'ENDED'
AND message.event IN (:events)
AND message.author_role = 'backoffice-user'
AND (
    array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
    OR chat.end_user_url = ANY(ARRAY[:urls]::TEXT[])
)
AND chat.ended::date BETWEEN :start::date AND :end::date
GROUP BY date_time, event
ORDER BY event
