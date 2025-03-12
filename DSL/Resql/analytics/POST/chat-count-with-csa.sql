SELECT DATE_TRUNC(:period, ended) AS time,
    COUNT(DISTINCT base_id) AS count
FROM chat
WHERE ended:: date BETWEEN :
start :: date AND :
end::date AND status = 'ENDED'
AND EXISTS (
    SELECT 1
    FROM message
    WHERE message.chat_base_id = chat.base_id
    AND message.author_role = 'backoffice-user'
)
AND EXISTS (
    SELECT 1
    FROM message
    WHERE message.chat_base_id = chat.base_id
    and message.event = 'taken-over'
)
GROUP BY time
ORDER BY time
