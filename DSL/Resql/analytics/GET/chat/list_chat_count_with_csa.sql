/*
declaration:
  version: 0.1
  description: "Count chats that ended and involved both a backoffice-user and a 'taken-over' event, grouped by time period"
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
        description: "Time granularity for grouping results"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Start of the grouped time period"
      - field: count
        type: integer
        description: "Number of ended chats with backoffice-user involvement and a 'taken-over' event"
*/
SELECT
    DATE_TRUNC(:period, ended) AS time,
    COUNT(DISTINCT chat_base_id) AS count
FROM (
    SELECT DISTINCT ON (chat_base_id)
        chat_base_id,
        ended
    FROM denormalized_chat_messages_for_metrics
    WHERE ended >= :start::DATE AND ended < (:end::DATE + INTERVAL '1 day')
        AND chat_status = 'ENDED'
        AND EXISTS (
            SELECT 1
            FROM denormalized_chat_messages_for_metrics AS dcm_inner
            WHERE
                dcm_inner.chat_base_id
                = denormalized_chat_messages_for_metrics.chat_base_id
                AND dcm_inner.message_author_role = 'backoffice-user'
        )
        AND EXISTS (
            SELECT 1
            FROM denormalized_chat_messages_for_metrics AS dcm_inner
            WHERE
                dcm_inner.chat_base_id
                = denormalized_chat_messages_for_metrics.chat_base_id
                AND dcm_inner.message_event = 'taken-over'
        )
    ORDER BY chat_base_id ASC, timestamp DESC
) AS filtered_csa_chats
GROUP BY time
ORDER BY time;
