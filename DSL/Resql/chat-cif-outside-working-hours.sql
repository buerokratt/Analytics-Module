WITH config AS (
    SELECT 
        (
            SELECT value
            FROM configuration
            WHERE key = 'organizationWorkingTimeStartISO'
            AND deleted IS false
			ORDER BY created DESC
			LIMIT 1
        )::date AS workingTimeStart,
        (
            SELECT value
            FROM configuration
            WHERE key = 'organizationWorkingTimeEndISO'
            AND deleted IS false
			ORDER BY created DESC
			LIMIT 1
        )::date AS workingTimeEnd
)
SELECT
    DATE_TRUNC(:period, chat.created) AS time,
    COUNT(DISTINCT base_id) AS chat_count
FROM chat  
JOIN customer_support_agent_activity AS csa
ON chat.customer_support_id = csa.id_code
WHERE chat.created BETWEEN :start::date AND :end::date
AND EXISTS (
    SELECT 1
    FROM message
    WHERE message.chat_base_id = chat.base_id
    AND message.event = 'contact-information-fulfilled'
    AND (
		EXTRACT(HOUR FROM message.created)
		NOT BETWEEN EXTRACT(HOUR FROM (SELECT workingTimeStart FROM config)) 
		AND EXTRACT(HOUR FROM (SELECT workingTimeEnd FROM config))
	)
)
GROUP BY time
ORDER BY time
