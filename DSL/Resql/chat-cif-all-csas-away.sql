SELECT
    DATE_TRUNC(:period, chat.created) AS time, 
    COUNT(DISTINCT base_id) AS chat_count
FROM chat
JOIN customer_support_agent_activity AS csa
ON chat.customer_support_id = csa.id_code
WHERE chat.created BETWEEN :start::date AND :end::date
AND csa.status = 'AWAY'
AND EXISTS (
    SELECT 1
    FROM message
    WHERE message.chat_base_id = chat.base_id
    AND message.event = 'contact-information-fulfilled'
)
GROUP BY time
ORDER BY time
