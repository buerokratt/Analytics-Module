WITH contact_response_times AS (
    SELECT 
        base_id, 
        EXTRACT(EPOCH FROM 
            MIN(created) FILTER (
                WHERE author_role = 'backoffice-user'
                AND created > (
                    SELECT MIN(created)
                    FROM message
                    WHERE event = 'contact-information-fulfilled'
                    AND base_id = message.base_id
                )
            ) - 
            MIN(created) FILTER (WHERE event = 'contact-information-fulfilled')
        ) AS waiting_time_seconds
    FROM message
    GROUP BY base_id
)

SELECT 
    DATE_TRUNC(:period, created) AS time, 
    COUNT(waiting_time_seconds) AS long_waiting_time
FROM chat
JOIN contact_response_times
ON chat.base_id = contact_response_times.base_id
WHERE created BETWEEN :start::timestamptz AND :end::timestamptz
AND waiting_time_seconds > :threshold_seconds
GROUP BY time
ORDER BY time
