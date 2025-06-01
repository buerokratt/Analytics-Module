/*
declaration:
  version: 0.1
  description: "Calculate average chat session duration (in minutes) for chats involving backoffice users and marked as ENDED"
  method: get
  namespace: byk
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering closed chats"
      - field: end
        type: date
        description: "End date for filtering closed chats"
      - field: period
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time granularity for grouping average session durations"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Start of the time interval for aggregated session durations"
      - field: avg_sesssion_time
        type: number
        description: "Average session time in minutes for the period"
*/
WITH
    chat_stats AS (
        SELECT
            chat_base_id,
            MAX(created) AS created,
            MAX(last_message_timestamp - first_message_timestamp) AS duration,
            BOOL_OR(chat_status = 'ENDED') AS has_ended_status,
            BOOL_OR(message_author_role = 'backoffice-user') AS has_backoffice
        FROM chat.denormalized_chat_messages_for_metrics
        WHERE created >= :start::DATE AND created < (:end::DATE + INTERVAL '1 day')
        GROUP BY chat_base_id
    ),

    backoffice_chats AS (
        SELECT
            chat_base_id,
            created,
            duration
        FROM chat_stats
        WHERE
            has_ended_status = true
            AND has_backoffice = true
    )

SELECT
    DATE_TRUNC(:period, created) AS time,
    ROUND(
        EXTRACT(EPOCH FROM COALESCE(AVG(duration), '0 minutes'::INTERVAL)) / 60
    ) AS avg_session_time
FROM backoffice_chats
GROUP BY time
ORDER BY time;
