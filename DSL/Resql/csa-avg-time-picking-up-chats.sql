WITH botname AS (
    SELECT "value"
    FROM "configuration"
    WHERE "key" = 'bot_institution_id'
    LIMIT 1
), customer_support_changes AS (
    SELECT base_id,
        customer_support_id,
        updated,
        date_trunc(:metric, created) AS date_time,
        lag(customer_support_id) over (
            PARTITION by base_id
            ORDER BY updated
        ) AS prev_support_id,
        lag(updated) over (
            PARTITION by base_id
            ORDER BY updated
        ) AS prev_updated
    FROM chat
    WHERE created::date BETWEEN :start::date AND :end::date
)
SELECT date_time, ROUND(COALESCE(
        AVG(
            extract(
                epoch
                FROM (updated - prev_updated)
            )
        ),
        0
    ) / 60) AS avg_min
FROM customer_support_changes
WHERE prev_support_id = ''
    AND customer_support_id NOT IN (
        (
            SELECT "value"
            FROM botname
        ),
        ''
    )
GROUP BY date_time
