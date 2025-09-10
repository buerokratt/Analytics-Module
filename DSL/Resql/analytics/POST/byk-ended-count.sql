WITH latest_per_base AS (
    SELECT DISTINCT ON (c.base_id) c.*
FROM chat c
WHERE c.status = 'ENDED'
  AND c.created::date BETWEEN :start::date AND :end::date
    ORDER BY c.base_id, c.updated DESC
)
SELECT
    DATE_TRUNC(:period, lp.created) AS time,
    COUNT(DISTINCT lp.base_id) AS count
FROM latest_per_base lp
WHERE (:showTest = TRUE OR lp.test = FALSE)
  AND (
    array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
   OR lp.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
    )
  AND lp.customer_support_id = 'chatbot'
GROUP BY time
ORDER BY time ASC;
