WITH botname AS (SELECT value
                 FROM configuration
                 WHERE
    key = 'bot_institution_id'
    LIMIT 1
    )
   , customer_support_changes AS (
SELECT
    c.base_id, c.customer_support_id, c.updated, date_trunc(:metric, c.created) AS date_time, lag(c.customer_support_id) OVER (
    PARTITION BY c.base_id
    ORDER BY c.updated
    ) AS prev_support_id, lag(c.updated) OVER (
    PARTITION BY c.base_id
    ORDER BY c.updated
    ) AS prev_updated
FROM chat c
WHERE (array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
   OR c.end_user_url LIKE ANY (ARRAY[:urls]::TEXT[]))
  AND (:showTest = TRUE OR c.test = FALSE)
        AND created::date BETWEEN :start::date AND :end::date
)
SELECT date_time, ROUND(COALESCE(
        AVG(
            extract(
                epoch FROM (updated - prev_updated)
            )
        ) / 60), 2
    ) AS avg_min
FROM customer_support_changes
WHERE prev_support_id = ''
    AND customer_support_id NOT IN (
        (
            SELECT "value"
            FROM botname
        ),
        ''
    )
GROUP BY date_time;
