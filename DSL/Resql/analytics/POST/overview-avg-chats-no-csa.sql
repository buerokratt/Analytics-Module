WITH chats AS (
    SELECT COUNT(DISTINCT base_id) AS num_chats,
           date_trunc('day', ended) AS ended
    FROM chat
    WHERE EXISTS (
        SELECT 1
        FROM message
        WHERE message.chat_base_id = chat.base_id
          AND message.author_role = 'end-user'
    )
      AND NOT EXISTS (
        SELECT 1
        FROM message
        WHERE message.chat_base_id = chat.base_id
          AND message.author_role = 'backoffice-user'
    )
      AND EXISTS (
        SELECT 1
        FROM message
        WHERE message.chat_base_id = chat.base_id
          AND message.author_role = 'buerokratt'
    )
      AND (
        array_length(ARRAY[:urls]::text[], 1) IS NULL
            OR (array_length(ARRAY[:urls]::text[], 1) = 1 AND (ARRAY[:urls]::text[])[1] = 'none')
            OR chat.end_user_url LIKE ANY(ARRAY[:urls]::text[])
        )
      AND (
        :showTest = TRUE
            OR chat.test = FALSE
        )
      AND chat.ended >= date_trunc(
            :group_period,
            current_date - concat('1 ', :group_period)::INTERVAL
                        )
    GROUP BY 2
)
SELECT date_trunc(:group_period, timescale.ended) AS ended,
       ROUND(AVG(COALESCE(num_chats, 0))) AS metric_value
FROM (
         SELECT date_trunc(
                        'day',
                        generate_series(
                                date_trunc(
                                        :group_period,
                                        current_date - concat('1 ', :group_period)::INTERVAL
                                ),
                                NOW(),
                                '1 day'::INTERVAL
                        )
                ) AS ended
     ) AS timescale
         LEFT JOIN chats ON chats.ended = timescale.ended
GROUP BY 1
ORDER BY 1 DESC;