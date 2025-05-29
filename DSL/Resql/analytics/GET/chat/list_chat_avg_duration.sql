/*
declaration:
  version: 0.1
  description: "Calculate average duration of ended chats grouped by time period"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering ended chats"
      - field: end
        type: date
        description: "End date for filtering ended chats"
      - field: period
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time granularity for grouping the average duration"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Start of the grouped time period"
      - field: avg_duration
        type: number
        description: "Average chat duration in minutes for the period"
*/
WITH
    chat_stats AS (
        SELECT
            chat_base_id,
            MAX(created) AS created,
            MAX(last_message_timestamp - first_message_timestamp) AS duration
        FROM denormalized_chat_messages_for_metrics
        WHERE chat_status = 'ENDED'
        AND created >= :start::DATE AND created < (:end::DATE + INTERVAL '1 day')
        GROUP BY chat_base_id
    )

SELECT
    DATE_TRUNC(:period, created) AS time,
    ROUND(
        EXTRACT(EPOCH FROM COALESCE(AVG(duration), '0 minutes'::INTERVAL)) / 60
    ) AS avg_duration
FROM chat_stats
GROUP BY time
ORDER BY time;
