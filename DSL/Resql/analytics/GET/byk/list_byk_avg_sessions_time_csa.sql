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
        AND dcm_inner.chat_status = 'ENDED'
    )
    AND EXISTS (
        SELECT 1
        FROM denormalized_chat_messages_for_metrics dcm_inner
        WHERE dcm.chat_base_id = dcm_inner.chat_base_id
        AND dcm_inner.message_author_role = 'backoffice-user'
    )
    AND created::date BETWEEN :start::date AND :end::date
    ORDER BY chat_base_id, timestamp DESC
)
SELECT
    DATE_TRUNC(:period, created) AS time,
    ROUND(EXTRACT(epoch FROM COALESCE(AVG(duration), '0 minutes'::interval))/60) AS avg_sesssion_time
FROM closed_chats
GROUP BY time
ORDER BY time;