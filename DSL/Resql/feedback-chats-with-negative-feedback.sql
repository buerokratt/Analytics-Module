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
       chat.feedback_text AS feedback,
       CEIL(COUNT(*) OVER() / :page_size::DECIMAL) AS total_pages
FROM n_chats
LEFT JOIN chat ON n_chats.base_id = chat.base_id
JOIN c_chat ON c_chat.base_id = chat.base_id AND n_chats.created = chat.created
WHERE chat.feedback_rating IS NOT NULL
AND chat.ended IS NOT NULL
ORDER BY 
   CASE WHEN :sorting = 'created desc' THEN n_chats.created END DESC,
   CASE WHEN :sorting = 'created asc' THEN n_chats.created END ASC,
   CASE WHEN :sorting = 'ended desc' THEN n_chats.created END DESC,
   CASE WHEN :sorting = 'ended asc' THEN n_chats.created END ASC,
   CASE WHEN :sorting = 'base_id desc' THEN n_chats.base_id END DESC,
   CASE WHEN :sorting = 'base_id asc' THEN n_chats.base_id END ASC,
   CASE WHEN :sorting = 'feedback desc' THEN feedback_text END DESC,
   CASE WHEN :sorting = 'feedback asc' THEN feedback_text END ASC,
   CASE WHEN :sorting = 'rating desc' THEN feedback_rating END DESC,
   CASE WHEN :sorting = 'rating asc' THEN feedback_rating END ASC
OFFSET ((GREATEST(:page, 1) - 1) * :page_size) LIMIT :page_size;
