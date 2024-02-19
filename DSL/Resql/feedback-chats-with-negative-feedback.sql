WITH n_chats AS
  (SELECT base_id,
          max(created) AS created
   FROM chat
   WHERE feedback_rating IS NOT NULL
     AND STATUS = 'ENDED'
     AND feedback_rating::int <= 5
     AND created::date BETWEEN :start::date AND :end::date
   GROUP BY base_id
   ORDER BY created DESC)
SELECT n_chats.base_id,
       n_chats.created,
       chat.ended,
       chat.feedback_rating AS rating,
       chat.feedback_text AS feedback
FROM n_chats
LEFT JOIN chat ON n_chats.base_id = chat.base_id
AND n_chats.created = chat.created
WHERE chat.feedback_rating IS NOT NULL
AND chat.ended IS NOT NULL
ORDER BY created DESC
