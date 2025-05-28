WITH counts AS (
    SELECT 
        chat_base_id,
        COUNT(*) as num_of_messages,
        MIN(created) as created
    FROM message
    WHERE created >= :start::date AND created < (:end::date + INTERVAL '1 day')
    GROUP BY chat_base_id
)
SELECT 
    DATE_TRUNC(:period, created) AS time,
    AVG(num_of_messages) as avg_num_of_messages
FROM counts
GROUP BY time
ORDER BY time
