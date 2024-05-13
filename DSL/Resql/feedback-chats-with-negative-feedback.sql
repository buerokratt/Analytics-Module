WITH n_chats AS (
  SELECT
    base_id,
    MAX(created) AS created
  FROM chat
  WHERE STATUS = 'ENDED'
  AND created::date BETWEEN :start::date AND :end::date
  AND feedback_rating IS NOT NULL
  AND feedback_rating <= 5
  GROUP BY base_id
),
c_chat AS (
  SELECT base_id,
    MIN(created) AS created,
    MAX(ended) AS ended
  FROM chat
  GROUP BY base_id
)
SELECT n_chats.base_id,
       c_chat.created,
       c_chat.ended,
       chat.feedback_rating AS rating,
       chat.feedback_text AS feedback
FROM n_chats
LEFT JOIN chat ON n_chats.base_id = chat.base_id
JOIN c_chat ON c_chat.base_id = chat.base_id AND n_chats.created = chat.created
WHERE chat.feedback_rating IS NOT NULL
AND chat.ended IS NOT NULL
ORDER BY c_chat.created DESC;
