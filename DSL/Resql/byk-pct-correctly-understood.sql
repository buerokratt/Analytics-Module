SELECT 
    DATE_TRUNC(:period, created) as time,
    (
        SUM(
            CASE
                WHEN author_role != 'chatbot'
                AND event != 'not-confident'
                THEN 1
                ELSE 0
            END
        )::float / COUNT(*)::float 
    ) * 100 AS percentage_correctly_understood
FROM message 
WHERE created::date BETWEEN :start::date AND :end::date
AND author_role = 'chatbot'
GROUP BY time
ORDER BY time
