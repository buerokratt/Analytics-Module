/*
declaration:
  version: 0.1
  description: "Calculate average chat session duration (in minutes) over time for closed chats without backoffice-user involvement"
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
        description: "Time period for grouping session durations"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Truncated timestamp representing the period"
      - field: avg_sesssion_time
        type: number
        description: "Average session time in minutes during the time period"
*/
WITH chat_stats AS (
    SELECT 
        chat_base_id,
        MAX(created) as created,
        MAX(last_message_timestamp - first_message_timestamp) AS duration,
        BOOL_OR(chat_status IN ('ENDED', 'IDLE')) as has_ended_status,
        BOOL_OR(message_author_role = 'backoffice-user') as has_backoffice
    FROM denormalized_chat_messages_for_metrics
    WHERE created >= :start::date AND created < (:end::date + INTERVAL '1 day')
    GROUP BY chat_base_id
),
closed_chats AS (
    SELECT chat_base_id, created, duration
    FROM chat_stats
    WHERE has_ended_status = true
    AND has_backoffice = false
)
SELECT
    DATE_TRUNC(:period, created) AS time,
    ROUND(EXTRACT(epoch FROM COALESCE(AVG(duration), '0 minutes'::interval))/60) AS avg_session_time
FROM closed_chats
GROUP BY time
ORDER BY time