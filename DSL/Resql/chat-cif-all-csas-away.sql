WITH offlineCSAs AS (
  SELECT COUNT(csa.id_code) AS csaCount
  FROM customer_support_agent_activity csa
  WHERE csa.id = (
    SELECT MAX(id)
    FROM customer_support_agent_activity
    WHERE id_code = csa.id_code
  )
  AND csa.status = 'offline'
  AND csa.created::date BETWEEN :start::date AND :end::date
),
AllCSAs AS (
  SELECT COUNT(*) AS userCount FROM public.user
)
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
  AND (SELECT userCount FROM AllCSAs) = (SELECT csaCount FROM offlineCSAs)
GROUP BY time
ORDER BY time;
