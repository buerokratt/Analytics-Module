WITH event_counts AS (
    SELECT 
        chat_base_id,
        date_trunc('hour', ended) AS hour_ended,
        MAX(CASE WHEN message_event = 'CLIENT_LEFT_WITH_ACCEPTED' THEN 1 ELSE NULL END) AS client_left_with_accepted,
        MAX(CASE WHEN message_event = 'CLIENT_LEFT_WITH_NO_RESOLUTION' THEN 1 ELSE NULL END) AS client_left_with_no_resolution,
        MAX(CASE WHEN message_event = 'HATE_SPEECH' THEN 1 ELSE NULL END) AS hate_speech,
        MAX(CASE WHEN message_event = 'ACCEPTED' THEN 1 ELSE NULL END) AS accepted,
        MAX(CASE WHEN message_event = 'OTHER' THEN 1 ELSE NULL END) AS other,
        MAX(CASE WHEN message_event = 'RESPONSE_SENT_TO_CLIENT_EMAIL' THEN 1 ELSE NULL END) AS response_sent_to_client_email
    FROM (
        SELECT DISTINCT ON (chat_base_id, message_id)
            chat_base_id,
            message_id,
            ended,
            message_event
        FROM denormalized_chat_messages_for_metrics
        WHERE ended >= date_trunc('hour', CURRENT_DATE)
        ORDER BY chat_base_id, message_id, timestamp DESC
    ) AS unique_messages
    GROUP BY chat_base_id, date_trunc('hour', ended)
)
SELECT 
    timescale.ended AS ended,
    COUNT(DISTINCT chat_base_id) AS metric_value,
    COUNT(DISTINCT chat_base_id) FILTER (WHERE client_left_with_accepted IS NOT NULL) AS client_left_with_accepted,
    COUNT(DISTINCT chat_base_id) FILTER (WHERE client_left_with_no_resolution IS NOT NULL) AS client_left_with_no_resolution,
    COUNT(DISTINCT chat_base_id) FILTER (WHERE hate_speech IS NOT NULL) AS hate_speech,
    COUNT(DISTINCT chat_base_id) FILTER (WHERE accepted IS NOT NULL) AS accepted,
    COUNT(DISTINCT chat_base_id) FILTER (WHERE other IS NOT NULL) AS other,
    COUNT(DISTINCT chat_base_id) FILTER (WHERE response_sent_to_client_email IS NOT NULL) AS response_sent_to_client_email
FROM (
    SELECT date_trunc(
            'hour',
            generate_series(
                current_date,
                NOW(),
                '1 hour'::INTERVAL
            )
        ) AS ended
) AS timescale
LEFT JOIN event_counts ON event_counts.hour_ended = timescale.ended
GROUP BY 1
ORDER BY 1 DESC;
