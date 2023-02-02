WITH botname AS (
    SELECT "value" AS name
    FROM "configuration"
    WHERE "key" = 'bot_institution_id'
    LIMIT 1
)
SELECT
    DATE_TRUNC(:period, c.created) AS time, 
    COUNT(DISTINCT base_id) AS chat_count
FROM chat c
JOIN customer_support_agent_activity AS csa
ON c.customer_support_id = csa.id_code
WHERE chat.created BETWEEN :start::date AND :end::date
AND csa.status = 'AWAY'
AND csa.created BETWEEN c.created AND c.ended
AND NOT EXISTS (
    SELECT 1
    FROM chat
    WHERE base_id = c.base_id
	AND customer_support_id <> ''
	AND customer_support_id <> (SELECT name FROM botname)
)
GROUP BY time
ORDER BY time
