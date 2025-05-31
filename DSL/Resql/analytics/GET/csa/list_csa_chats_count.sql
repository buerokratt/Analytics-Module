/*
declaration:
  version: 0.1
  description: "Count distinct chats handled by each CSA or end-user over time, excluding specified CSAs"
  method: get
  namespace: csa
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering chat messages"
      - field: end
        type: date
        description: "End date for filtering chat messages"
      - field: metric
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time granularity for grouping results"
      - field: excluded_csas
        type: string
        description: "Comma-separated list of CSA IDs to exclude (array format)"
  response:
    fields:
      - field: date_time
        type: timestamp
        description: "Truncated timestamp representing the grouped period"
      - field: customer_support_id
        type: string
        description: "ID of the CSA or end-user who authored the message"
      - field: count
        type: integer
        description: "Count of distinct chats handled by the author during the period"
*/
WITH
    final_data AS (
        SELECT DISTINCT ON (chat_base_id)
            DATE_TRUNC(:metric, created) AS date_time,
            chat_base_id,
            message_author_id,
            message_author_id AS id_code
        FROM chat.denormalized_chat_messages_for_metrics
        WHERE
            message_author_role IN ('backoffice-user', 'end-user')
            AND message_author_id IS NOT NULL
            AND message_author_id <> ''
            AND message_author_id <> 'null'
            AND created >= :start::DATE
            AND created < (:end::DATE + INTERVAL '1 day')
            AND message_author_id <> ALL(STRING_TO_ARRAY(:excluded_csas, ','))
        ORDER BY chat_base_id ASC, timestamp DESC
    )

SELECT
    date_time,
    MAX(id_code) AS customer_support_id,
    COUNT(DISTINCT chat_base_id) AS count
FROM final_data
GROUP BY date_time, message_author_id;
