WITH botname AS (
    SELECT "value"
    FROM "configuration"
    WHERE "key" = 'bot_institution_id'
    LIMIT 1
), customer_support_changes AS (
    SELECT base_id,
        customer_support_id,
        updated,
        lag(customer_support_id) over (
            PARTITION by base_id
            ORDER BY updated
        ) AS prev_support_id,
        lag(updated) over (
            PARTITION by base_id
            ORDER BY updated
        ) AS prev_updated
    FROM chat
    WHERE created BETWEEN :start::timestamptz AND :end::timestamptz
)
SELECT COALESCE(
        AVG(
            extract(
                epoch
                FROM (updated - prev_updated)
            )
        ),
        0
    ) AS avg_waiting_time_seconds
FROM customer_support_changes
WHERE prev_support_id = ''
    AND customer_support_id NOT IN (
        (
            SELECT "value"
            FROM botname
        ),
        ''
    );
