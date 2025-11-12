WITH chat_stats AS (
    SELECT 
        date_trunc('hour', ended AT TIME ZONE :timezone) AS ended,
        base_id,
        EXISTS (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
            AND "event" = 'CLIENT_LEFT_WITH_ACCEPTED'
        ) AS client_left_with_accepted,
        EXISTS (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
            AND "event" = 'CLIENT_LEFT_WITH_NO_RESOLUTION'
        ) AS client_left_with_no_resolution,
        EXISTS (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
            AND "event" = 'HATE_SPEECH'
        ) AS hate_speech,
        EXISTS (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
            AND "event" = 'ACCEPTED'
        ) AS accepted,
        EXISTS (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
            AND "event" = 'OTHER'
        ) AS other_event,
        EXISTS (
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
    AND ended::timestamptz BETWEEN :start::timestamptz AND :end::timestamptz
)
SELECT 
    timescale.ended AS ended,
    COUNT(DISTINCT base_id) AS metric_value,
    COUNT(DISTINCT base_id) FILTER (WHERE client_left_with_accepted) AS client_left_with_accepted,
    COUNT(DISTINCT base_id) FILTER (WHERE client_left_with_no_resolution) AS client_left_with_no_resolution,
    COUNT(DISTINCT base_id) FILTER (WHERE hate_speech) AS hate_speech,
    COUNT(DISTINCT base_id) FILTER (WHERE accepted) AS accepted,
    COUNT(DISTINCT base_id) FILTER (WHERE response_sent_to_client_email) AS response_sent_to_client_email,
    COUNT(DISTINCT base_id) - (
        COUNT(DISTINCT base_id) FILTER (WHERE client_left_with_accepted) +
        COUNT(DISTINCT base_id) FILTER (WHERE client_left_with_no_resolution) +
        COUNT(DISTINCT base_id) FILTER (WHERE hate_speech) +
        COUNT(DISTINCT base_id) FILTER (WHERE accepted) +
        COUNT(DISTINCT base_id) FILTER (WHERE response_sent_to_client_email)
    ) AS other
FROM (
    SELECT date_trunc(
        'hour',
        generate_series(
            (current_date),
            (NOW() AT TIME ZONE :timezone),
            '1 hour'::INTERVAL
        )
    ) AS ended
) AS timescale
LEFT JOIN chat_stats ON chat_stats.ended = timescale.ended
GROUP BY 1
ORDER BY 1 DESC;
