SELECT 
    DATE_TRUNC(:period, created) AS time,
    COUNT(DISTINCT base_id) AS count
FROM chat
WHERE created::date BETWEEN :start::date AND :end::date
AND NOT EXISTS (
    SELECT 1
    FROM message
    WHERE message.chat_base_id = chat.base_id
    AND message.author_role = 'backoffice-user'
)
GROUP BY time
ORDER BY time
