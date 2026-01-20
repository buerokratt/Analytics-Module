WITH rating_config AS (
    SELECT value AS is_five_rating_scale
    FROM configuration
    WHERE key = 'isFiveRatingScale'
      AND id IN (SELECT max(id) FROM configuration WHERE key = 'isFiveRatingScale' GROUP BY key)
      AND NOT deleted
)
SELECT date_trunc(:metric, ended) AS date_time,
       CASE 
           WHEN (SELECT COALESCE(is_five_rating_scale, 'false') = 'true' FROM rating_config) 
           THEN ROUND(1.0 * SUM(CASE WHEN feedback_rating_five IS NOT NULL THEN feedback_rating_five ELSE 0 END) / NULLIF(COUNT(DISTINCT base_id), 0), 1)
           ELSE ROUND(1.0 * SUM(CASE WHEN feedback_rating IS NOT NULL THEN feedback_rating ELSE 0 END) / NULLIF(COUNT(DISTINCT base_id), 0), 1)
       END AS avg
FROM chat
WHERE (
    array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
   OR chat.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
    )
  AND (
    :showTest = TRUE
   OR chat.test = FALSE
    )
  AND EXISTS
    (SELECT 1
     FROM message
     WHERE message.chat_base_id = chat.base_id
       AND (message.author_role = 'buerokratt' OR message.author_role = 'Bürokratt'))
AND status = 'ENDED'
AND ended::timestamptz BETWEEN :start::timestamptz AND :end::timestamptz
GROUP BY date_time
