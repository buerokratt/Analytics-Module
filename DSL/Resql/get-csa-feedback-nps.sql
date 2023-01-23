SELECT CAST(((
  SUM(CASE WHEN feedback_rating::int BETWEEN 9 AND 10 THEN 1 END) * 1.0 -
  SUM(CASE WHEN feedback_rating::int BETWEEN 0 AND 6 THEN 1 END)
  ) / COUNT(DISTINCT base_id) * 100) AS int) as nps
FROM chat
WHERE EXISTS
    (SELECT 1
     FROM message
     WHERE message.chat_base_id = chat.base_id
       AND message.author_role = 'backoffice-user')
AND status = 'ENDED'
AND feedback_rating IS NOT null
AND created::date BETWEEN :start::date AND :end::date
