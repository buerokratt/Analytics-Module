SELECT intent, COUNT(DISTINCT base_id) AS intent_count
FROM message
WHERE intent IS NOT NULL
GROUP BY intent
