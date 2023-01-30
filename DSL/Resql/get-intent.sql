SELECT COUNT(DISTINCT base_id) AS intent_count
FROM message
WHERE intent = :inent::varchar(50)
GROUP BY intent
