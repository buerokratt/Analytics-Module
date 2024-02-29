SELECT
  DATE_TRUNC(:period, c.created) AS time,
  COUNT(DISTINCT c.base_id) AS chat_count
FROM chat c
JOIN message m ON c.base_id = m.chat_base_id 
WHERE m.event = 'contact-information-fulfilled'
  AND c.created::date BETWEEN :start::date AND :end::date
GROUP BY time
ORDER BY time;
