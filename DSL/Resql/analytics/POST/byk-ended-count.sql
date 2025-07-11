SELECT
    DATE_TRUNC(:period, created) AS time,
    COUNT(DISTINCT base_id)
FROM chat
WHERE created::date BETWEEN :start::date AND :end::date
AND status = 'ENDED'
AND customer_support_id = 'chatbot'
GROUP BY time
ORDER BY time
