/*
declaration:
  version: 0.1
  description: "Calculate the average chat duration in minutes per customer support agent over time, excluding specified agents"
  method: get
  namespace: csa
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering chats"
      - field: end
        type: date
        description: "End date for filtering chats"
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
        description: "ID of the customer support agent"
      - field: avg_min
        type: number
        description: "Average duration of chats in minutes for the given period and CSA"
*/
WITH
    distinct_chats AS (
        SELECT DISTINCT ON (chat_base_id, message_author_id)
            chat_base_id AS base_id,
            DATE_TRUNC(:metric, created) AS date_time,
            message_author_id AS author_id,
            AGE(last_message_timestamp, first_message_timestamp) AS chat_length
        FROM chat.denormalized_chat_messages_for_metrics
        WHERE
            created IS NOT NULL
            AND created >= :start::DATE AND created < (:end::DATE + INTERVAL '1 day')
            AND message_author_role IN ('backoffice-user', 'end-user')
            AND message_author_id IS NOT NULL
            AND message_author_id <> ''
            AND message_author_id <> 'null'
            AND message_author_id NOT IN (:excluded_csas)
        ORDER BY chat_base_id ASC, message_author_id ASC, timestamp DESC
    )

SELECT
    date_time,
    MAX(author_id) AS customer_support_id,
    ROUND(
        EXTRACT(EPOCH FROM COALESCE(AVG(chat_length), '0 seconds'::INTERVAL)) / 60
    ) AS avg_min
FROM distinct_chats
GROUP BY date_time, author_id;
