WITH csa_chats AS (
  SELECT
    base_id,
    MIN(created) AS start_time,
    MAX(created) AS end_time
  FROM message
  WHERE
    author_role = 'csa' 
    AND created BETWEEN :start AND :end
  GROUP BY base_id
)
SELECT
  DATE_TRUNC(:period, start_time) as period,
  AVG(end_time - start_time) as avg_chat_time
FROM csa_chats
GROUP BY period
