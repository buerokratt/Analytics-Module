SELECT COUNT(DISTINCT id) 
FROM chat
WHERE feedback_rating IS NOT NULL
AND status = 'ENDED'
AND feedback_rating::int <= 5;