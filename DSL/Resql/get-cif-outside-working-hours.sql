SELECT date_trunc(:period, created) AS date_time, COUNT(DISTINCT base_id)
FROM chat  
JOIN customer_support_agent_activity AS csa ON chat.csa_id = csa.csa_id
WHERE created BETWEEN :start::timestamptz AND :end::timestamptz
AND exists (
    SELECT 1
    FROM message
    WHERE message.chat_base_id = chat.base_id
    AND message.event = 'contact-information-fulfilled'
    AND CASE 
            WHEN EXTRACT(DOW FROM created_at) NOT BETWEEN 2 AND 6 THEN true
            WHEN (EXTRACT(HOUR FROM created_at) NOT BETWEEN 9 AND 17) 
                OR (EXTRACT(MINUTE FROM created_at) NOT BETWEEN 0 AND 59) THEN true
            ELSE false
        END
)
