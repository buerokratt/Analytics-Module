WITH latest_per_base AS (
    SELECT DISTINCT ON (c.base_id)
    c.base_id,
    date_trunc(:group_period, c.ended) AS ended,
    c.test
FROM chat c
WHERE EXISTS (
    SELECT 1
    FROM message
    WHERE message.chat_base_id = c.base_id
  AND message.author_role = 'end-user'
    )
  AND NOT EXISTS (
    SELECT 1
    FROM message
    WHERE message.chat_base_id = c.base_id
  AND message.author_role = 'backoffice-user'
    )
  AND EXISTS (
    SELECT 1
    FROM message
    WHERE message.chat_base_id = c.base_id
  AND message.author_role = 'buerokratt'
    )
  AND (
    array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
   OR c.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
    )
  AND c.ended >= date_trunc(
    :group_period,
    current_date - concat('1 ', :group_period)::INTERVAL
    )
ORDER BY c.base_id, c.updated DESC
    ),
    chats AS (
SELECT lp.base_id, lp.ended
FROM latest_per_base lp
WHERE (:showTest = TRUE OR lp.test = FALSE)
    )
SELECT timescale.ended AS ended,
       COUNT(DISTINCT base_id) AS metric_value
FROM (
         SELECT date_trunc(
                        :group_period,
                        generate_series(
                                        current_date - concat('1 ', :group_period)::INTERVAL,
                                        NOW(),
                                        concat('1 ', :group_period)::INTERVAL
                        )
                ) AS ended
     ) AS timescale
         LEFT JOIN chats ON chats.ended = timescale.ended
GROUP BY 1
ORDER BY 1 DESC;