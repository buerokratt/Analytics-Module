SELECT
  DATE_TRUNC(:period, c.created) AS time,
  COUNT(DISTINCT c.base_id) AS chat_count
FROM chat c
JOIN message m ON c.base_id = m.chat_base_id 
WHERE c.created::date BETWEEN :start::date AND :end::date 
  AND (
    m.event LIKE '%contact-information-fulfilled' OR
    (c.end_user_email IS NOT NULL AND c.end_user_email <> '') OR
    (c.end_user_phone IS NOT NULL AND c.end_user_phone <> '')
  )
GROUP BY time
ORDER BY time;
