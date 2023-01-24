SELECT date_trunc(:metric, created) AS date_time,
       COUNT(DISTINCT base_id)
FROM chat
WHERE feedback_rating IS NOT NULL
  AND status = 'ENDED'
  AND feedback_rating::int <= 5
  AND created::date BETWEEN :start::date AND :end::date
GROUP BY 1
