/*
declaration:
  version: 0.1
  description: "Count distinct chats per hour and categorize them by resolution-related events such as accepted, hate speech, client exit reasons, etc."
  method: get
  namespace: overview
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: ended
        type: date
        description: "Hourly truncated timestamp for when the chat ended"
      - field: metric_value
        type: number
        description: "Total number of distinct chats per hour"
      - field: client_left_with_accepted
        type: number
        description: "Count of chats where the client left with an accepted resolution"
      - field: client_left_with_no_resolution
        type: number
        description: "Count of chats where the client left with no resolution"
      - field: hate_speech
        type: number
        description: "Count of chats flagged for hate speech"
      - field: accepted
        type: number
        description: "Count of chats marked as accepted"
      - field: other
        type: number
        description: "Count of chats labeled with 'OTHER' event"
      - field: response_sent_to_client_email
        type: number
        description: "Count of chats with responses sent to client email"
*/
WITH
    event_counts AS (
        SELECT
            chat_base_id,
            DATE_TRUNC('hour', ended) AS hour_ended,
            MAX(
                CASE WHEN message_event = 'client_left_with_accepted' THEN 1 END
            ) AS client_left_with_accepted,
            MAX(
                CASE WHEN message_event = 'client_left_with_no_resolution' THEN 1 END
            ) AS client_left_with_no_resolution,
            MAX(
                CASE WHEN message_event = 'hate_speech' THEN 1 END
            ) AS hate_speech,
            MAX(CASE WHEN message_event = 'accepted' THEN 1 END) AS accepted,
            MAX(CASE WHEN message_event = 'other' THEN 1 END) AS other,
            MAX(
                CASE WHEN message_event = 'response_sent_to_client_email' THEN 1 END
            ) AS response_sent_to_client_email
        FROM (
            SELECT DISTINCT ON (chat_base_id, message_id)
                chat_base_id,
                message_id,
                ended,
                message_event
            FROM denormalized_chat_messages_for_metrics
            WHERE ended >= DATE_TRUNC('hour', CURRENT_DATE)
            ORDER BY chat_base_id ASC, message_id ASC, timestamp DESC
        ) AS unique_messages
        GROUP BY chat_base_id, DATE_TRUNC('hour', ended)
    )

SELECT
    timescale.ended,
    COUNT(DISTINCT event_counts.chat_base_id) AS metric_value,
    COUNT(DISTINCT event_counts.chat_base_id) FILTER (
        WHERE client_left_with_accepted IS NOT NULL
    ) AS client_left_with_accepted,
    COUNT(DISTINCT event_counts.chat_base_id) FILTER (
        WHERE client_left_with_no_resolution IS NOT NULL
    ) AS client_left_with_no_resolution,
    COUNT(DISTINCT event_counts.chat_base_id) FILTER (
        WHERE hate_speech IS NOT NULL
    ) AS hate_speech,
    COUNT(DISTINCT event_counts.chat_base_id) FILTER (
        WHERE accepted IS NOT NULL
    ) AS accepted,
    COUNT(DISTINCT event_counts.chat_base_id) FILTER (WHERE other IS NOT NULL) AS other,
    COUNT(DISTINCT event_counts.chat_base_id) FILTER (
        WHERE response_sent_to_client_email IS NOT NULL
    ) AS response_sent_to_client_email
FROM (
    SELECT DATE_TRUNC(
        'hour',
        GENERATE_SERIES(
            CURRENT_DATE,
            NOW(),
            '1 hour'::INTERVAL
        )
    ) AS ended
) AS timescale
    LEFT JOIN event_counts ON timescale.ended = event_counts.hour_ended
GROUP BY 1
ORDER BY 1 DESC;
