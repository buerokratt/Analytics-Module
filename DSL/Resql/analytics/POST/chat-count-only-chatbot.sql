SELECT 
    DATE_TRUNC(:period, ended) AS time,
    COUNT(DISTINCT base_id) AS count
FROM chat
WHERE ended::date BETWEEN :start::date AND :end::date AND status = 'ENDED'
AND NOT EXISTS (
    SELECT *
    FROM message
    WHERE message.chat_base_id = chat.base_id
    AND message.author_role = 'backoffice-user'
    AND message.content = ''
)
GROUP BY time
ORDER BY time