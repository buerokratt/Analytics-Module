WITH workingTimeStart AS (
  SELECT value::timestamp AS time
  FROM configuration
  WHERE key = 'organizationWorkingTimeStartISO'
  AND deleted IS false
  ORDER BY created DESC
  LIMIT 1
),
workingTimeEnd AS (
  SELECT value::timestamp AS time
  FROM configuration
  WHERE key = 'organizationWorkingTimeEndISO'
  AND deleted IS false
  ORDER BY created DESC
  LIMIT 1
)
SELECT
  DATE_TRUNC(:period, c.created) AS time,
  COUNT(DISTINCT c.base_id) AS chat_count
FROM chat c
JOIN message m ON c.base_id = m.chat_base_id 
WHERE m.event = 'contact-information-fulfilled'
  AND c.created::date BETWEEN :start::date AND :end::date
  AND (
    EXTRACT(HOUR FROM m.created)
    NOT BETWEEN
    EXTRACT(HOUR FROM (SELECT time FROM workingTimeStart)) 
		AND
    EXTRACT(HOUR FROM (SELECT time FROM workingTimeEnd))
  )
GROUP BY time
ORDER BY time;
