SELECT 
    intent,
    COUNT(DISTINCT base_id) AS count
FROM message
WHERE intent IS NOT NULL
AND created >= :start::date AND created < (:end::date + INTERVAL '1 day')
GROUP BY intent
