WITH chats AS (
   SELECT id, status, feedback_rating, created
   FROM chat
   WHERE feedback_rating IS NOT NULL
   AND status = 'ENDED'
   AND feedback_rating::int <= 5
)
SELECT * FROM chats
WHERE 
CASE 
  WHEN :value = 'today' THEN created::date = current_date
  WHEN :value = 'yesterday' THEN created::date = current_date - 1
END;
