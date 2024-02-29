SELECT
  DATE_TRUNC(:period, c.created) AS time,
  COUNT(DISTINCT c.base_id) AS chat_count
FROM chat c
JOIN message m ON c.base_id = m.chat_base_id 
WHERE m.event = 'contact-information-fulfilled'
  AND c.created::date BETWEEN :start::date AND :end::date
  AND 0 < (
    SELECT COUNT(DISTINCT csa.id_code)
    FROM customer_support_agent_activity csa
    WHERE (csa.status = 'online' OR csa.status = 'idle')
    AND csa.created::date BETWEEN c.started::date AND m.created::date
  )
GROUP BY time
ORDER BY time;
