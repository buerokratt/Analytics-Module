/*
declaration:
  version: 0.1
  description: "Calculate average chat session duration (in minutes) for chats closed with events like 'answered' or 'client-left'"
  method: get
  namespace: byk
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering chat sessions"
      - field: end
        type: date
        description: "End date for filtering chat sessions"
      - field: period
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time period for aggregating session durations"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Truncated timestamp representing the period"
      - field: avg_sesssion_time
        type: number
        description: "Average session duration in minutes for the time period"
*/
WITH closed_chats AS (
    SELECT DISTINCT ON (chat_base_id)
        chat_base_id,
        created,
        (last_message_timestamp - first_message_timestamp) AS duration
    FROM denormalized_chat_messages_for_metrics dcm
    WHERE EXISTS (
        SELECT 1
        FROM denormalized_chat_messages_for_metrics dcm_inner
        WHERE dcm.chat_base_id = dcm_inner.chat_base_id
        AND dcm_inner.message_event IN ('answered', 'client-left')
    )
    AND created >= :start::date AND created < (:end::date + INTERVAL '1 day')
    ORDER BY chat_base_id, timestamp DESC
)
SELECT
    DATE_TRUNC(:period, created) AS time,
    ROUND(EXTRACT(epoch FROM COALESCE(AVG(duration), '0 minutes'::interval))/60) AS avg_sesssion_time
FROM closed_chats
GROUP BY time
ORDER BY time;