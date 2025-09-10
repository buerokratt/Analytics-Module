WITH latest_per_base AS (
    SELECT DISTINCT ON (c.base_id) c.*
FROM chat c
WHERE (
    array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
   OR c.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
    )
ORDER BY c.base_id, c.updated DESC
    ),
    chats AS (
SELECT lp.base_id,
    date_trunc(:group_period, lp.ended) AS ended
FROM latest_per_base lp
WHERE EXISTS (
    SELECT 1
    FROM message m
    WHERE m.chat_base_id = lp.base_id
  AND m.author_role = 'end-user'
    )
  AND (:showTest = TRUE OR lp.test = FALSE)
  AND lp.ended >= date_trunc(
    :group_period,
    current_date - concat('1 ', :group_period)::INTERVAL
    )
    )
SELECT ts.ended,
       COUNT(DISTINCT c.base_id) AS metric_value
FROM (
         SELECT date_trunc(
                        :group_period,
                        generate_series(
                                        current_date - concat('1 ', :group_period)::INTERVAL,
                                        NOW(),
                                        concat('1 ', :group_period)::INTERVAL
                        )
                ) AS ended
     ) ts
         LEFT JOIN chats c ON c.ended = ts.ended
GROUP BY ts.ended
ORDER BY ts.ended DESC;
