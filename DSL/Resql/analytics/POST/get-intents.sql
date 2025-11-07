SELECT 
    intent,
    COUNT(DISTINCT base_id) AS count
FROM message
WHERE intent IS NOT NULL
AND created::timestamptz BETWEEN :start::timestamptz AND :end::timestamptz
GROUP BY intent
