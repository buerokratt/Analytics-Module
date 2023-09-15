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
WHERE c.created::date BETWEEN :start::date AND :end::date
AND (
    (
        csa.status = 'offline' 
        AND csa.created::date BETWEEN c.created::date AND c.ended::date
    )
    OR (
        SELECT status
        FROM customer_support_agent_activity AS csa2
        WHERE csa2.id_code = c.customer_support_id
        AND csa2.created < c.created
        ORDER BY created DESC
        LIMIT 1
    ) = 'offline'
)
AND NOT EXISTS (
    SELECT 1
    FROM chat
    WHERE base_id = c.base_id
	AND customer_support_id <> ''
	AND customer_support_id <> (SELECT name FROM botname)
)
GROUP BY time
ORDER BY time
