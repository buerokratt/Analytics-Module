WITH customer_support_changes AS (
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
    WHERE created >= :start::date AND created < (:end::date + INTERVAL '1 day')
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
    AND customer_support_id <> ''
    AND customer_support_id <> 'chatbot'
GROUP BY date_time;
