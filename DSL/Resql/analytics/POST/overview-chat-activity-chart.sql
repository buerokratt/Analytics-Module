WITH chat_stats AS (
    SELECT date_trunc('hour', ended AT TIME ZONE :timezone) AS ended,
           base_id,
           (
               SELECT 1
               FROM message
               WHERE message.chat_base_id = chat.base_id
                 AND "event" = 'CLIENT_LEFT_WITH_ACCEPTED'
           ) AS client_left_with_accepted,
           (
               SELECT 1
               FROM message
               WHERE message.chat_base_id = chat.base_id
                 AND "event" = 'CLIENT_LEFT_WITH_NO_RESOLUTION'
           ) AS client_left_with_no_resolution,
           (
               SELECT 1
               FROM message
               WHERE message.chat_base_id = chat.base_id
                 AND "event" = 'HATE_SPEECH'
           ) AS hate_speech,
           (
               SELECT 1
               FROM message
               WHERE message.chat_base_id = chat.base_id
                 AND "event" = 'ACCEPTED'
           ) AS accepted,
           (
               SELECT 1
               FROM message
               WHERE message.chat_base_id = chat.base_id
                 AND "event" = 'OTHER'
           ) AS other,
           (
               SELECT 1
               FROM message
               WHERE message.chat_base_id = chat.base_id
                 AND "event" = 'RESPONSE_SENT_TO_CLIENT_EMAIL'
           ) AS response_sent_to_client_email
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
      AND (ended AT TIME ZONE :timezone) >= date_trunc('hour', (CURRENT_DATE AT TIME ZONE :timezone))
)
SELECT timescale.ended AS ended,
       COUNT(DISTINCT base_id) AS metric_value,
       COUNT(DISTINCT base_id) FILTER (
        WHERE client_left_with_accepted IS NOT NULL
    ) AS client_left_with_accepted,
    COUNT(DISTINCT base_id) FILTER (
        WHERE client_left_with_no_resolution IS NOT NULL
    ) AS client_left_with_no_resolution,
    COUNT(DISTINCT base_id) FILTER (
        WHERE hate_speech IS NOT NULL
    ) AS hate_speech,
    COUNT(DISTINCT base_id) FILTER (
        WHERE accepted IS NOT NULL
    ) AS accepted,
    COUNT(DISTINCT base_id) FILTER (
        WHERE other IS NOT NULL
    ) AS other,
    COUNT(DISTINCT base_id) FILTER (
        WHERE response_sent_to_client_email IS NOT NULL
    ) AS response_sent_to_client_email
FROM (
         SELECT date_trunc(
                        'hour',
                        generate_series(
                                        (current_date AT TIME ZONE :timezone),
                                        (NOW() AT TIME ZONE :timezone),
                                        '1 hour'::INTERVAL
                        )
                ) AS ended
     ) AS timescale
         LEFT JOIN chat_stats ON chat_stats.ended = timescale.ended
GROUP BY 1
ORDER BY 1 DESC;
