SELECT
  DATE_TRUNC(:period, c.created) AS time,
  COUNT(DISTINCT c.base_id) AS chat_count
FROM chat c
JOIN message m ON c.base_id = m.chat_base_id 
WHERE c.created::date BETWEEN :start::date AND :end::date
  AND (
    m.event LIKE '%contact-information-fulfilled' OR
    (c.end_user_email <> '' AND c.end_user_email IS NOT NULL) OR
    (c.end_user_phone <> '' AND c.end_user_phone IS NOT NULL)
  )
  AND 0 < (
    SELECT COUNT(DISTINCT csa.id_code)
    FROM customer_support_agent_activity csa
    WHERE (csa.status = 'online' OR csa.status = 'idle')
    AND csa.created::date BETWEEN c.created::date AND c.ended::date
  )
GROUP BY time
ORDER BY time;
