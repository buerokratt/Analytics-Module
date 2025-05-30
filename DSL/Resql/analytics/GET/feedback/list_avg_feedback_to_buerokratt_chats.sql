/*
declaration:
  version: 0.1
  description: "Calculate average feedback rating over time for chats involving the virtual assistant 'buerokratt'"
  method: get
  namespace: feedback
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering ended chats"
      - field: end
        type: date
        description: "End date for filtering ended chats"
      - field: metric
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time granularity for grouping average feedback ratings"
  response:
    fields:
      - field: date_time
        type: timestamp
        description: "Truncated timestamp representing the grouped time period"
      - field: avg
        type: number
        description: "Average feedback rating for the time period"
*/
SELECT
    DATE_TRUNC(:metric, ended) AS date_time,
    ROUND(
        1.0
        * SUM(COALESCE(feedback_rating, 0))
        / NULLIF(COUNT(DISTINCT chat_base_id), 0),
        1
    ) AS avg
FROM denormalized_chat_messages_for_metrics AS chat
WHERE
    EXISTS
    (
        SELECT 1
        FROM denormalized_chat_messages_for_metrics AS message
        WHERE
            message.chat_base_id = chat.chat_base_id
            AND message.message_author_role = 'buerokratt'
            OR message.message_author_role = 'Bürokratt'
    )
    AND chat_status = 'ENDED'
    AND ended >= :start::DATE
    AND ended < (:end::DATE + INTERVAL '1 day')
GROUP BY date_time
