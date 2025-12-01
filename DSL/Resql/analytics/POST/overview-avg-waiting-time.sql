WITH botname AS (
    SELECT "value"
    FROM "configuration"
    WHERE "key" = 'bot_institution_id'
    LIMIT 1
), customer_support_changes AS (
    SELECT base_id,
        date_trunc('day', created AT TIME ZONE :timezone) AS created,
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
    WHERE (
        array_length(ARRAY[:urls]::text[], 1) IS NULL
        OR (array_length(ARRAY[:urls]::text[], 1) = 1 AND (ARRAY[:urls]::text[])[1] = 'none')
        OR chat.end_user_url LIKE ANY(ARRAY[:urls]::text[])
    )
    AND (
        :showTest = TRUE
        OR chat.test = FALSE
    )
    AND (chat.created AT TIME ZONE :timezone) >= date_trunc(
        :group_period,
        (current_date AT TIME ZONE :timezone - concat('1 ', :group_period)::INTERVAL)
    )
)
SELECT date_trunc(:group_period, timescale.ended) AS ended,
       COALESCE(
           AVG(
               extract(
                   epoch
                   FROM (updated - prev_updated)
               )
           ) FILTER (
               WHERE prev_support_id = ''
               AND customer_support_id NOT IN (
                   (SELECT "value" FROM botname),
                   ''
               )
           ),
           0
       ) AS metric_value
FROM (
    SELECT date_trunc('day', period) AS ended
    FROM generate_series(
        date_trunc(
            :group_period,
            (current_date AT TIME ZONE :timezone - concat('1 ', :group_period)::INTERVAL)
        ),
        date_trunc(
            :group_period,
            (current_date AT TIME ZONE :timezone)
        ),
        '1 day'::INTERVAL
    ) AS period
) AS timescale
LEFT JOIN customer_support_changes csc
    ON csc.created = timescale.ended
GROUP BY 1
ORDER BY 1 desc;
