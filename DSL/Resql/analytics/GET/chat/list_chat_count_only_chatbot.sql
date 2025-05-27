/*
declaration:
  version: 0.1
  description: "Count chats that ended without backoffice-user involvement and were not taken over, grouped by time period"
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
        description: "Time granularity for grouping ended chat counts"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Truncated timestamp representing the grouped period"
      - field: count
        type: integer
        description: "Number of ended chats with no backoffice-user involvement and no takeover"
*/
WITH ended_chats AS (
    SELECT DISTINCT ON (chat_base_id)
        chat_base_id,
        ended
    FROM denormalized_chat_messages_for_metrics
    WHERE ended::date BETWEEN :start::date AND :end::date
    AND chat_status = 'ENDED'
    AND NOT EXISTS (
        SELECT 1
        FROM denormalized_chat_messages_for_metrics dcm_inner
        WHERE dcm_inner.chat_base_id = denormalized_chat_messages_for_metrics.chat_base_id
        AND dcm_inner.message_author_role = 'backoffice-user'
    )
    AND NOT EXISTS (
        SELECT 1
        FROM denormalized_chat_messages_for_metrics dcm_inner
        WHERE dcm_inner.chat_base_id = denormalized_chat_messages_for_metrics.chat_base_id
        AND dcm_inner.message_event = 'taken-over'
    )
    ORDER BY chat_base_id, timestamp DESC
)
SELECT 
    DATE_TRUNC(:period, ended) AS time,
    COUNT(DISTINCT chat_base_id) AS count
FROM ended_chats
GROUP BY time
ORDER BY time;
