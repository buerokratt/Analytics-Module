SELECT 
    intent,
    COUNT(DISTINCT base_id) AS count
FROM message
WHERE intent IS NOT NULL
AND created between :start::date AND :end::date
GROUP BY intent
