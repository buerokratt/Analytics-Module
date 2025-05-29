/*
declaration:
  version: 0.1
  description: "Count ended chats that either had no backoffice-user and no takeover, or had both backoffice-user involvement and a 'taken-over' event, grouped by time"
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
        description: "Time granularity for grouping chat counts"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Truncated timestamp representing the grouped time period"
      - field: sum_count
        type: integer
        description: "Total number of chats matching the conditions for the period"
*/
SELECT
    DATE_TRUNC(:period, ended) AS time,
    COUNT(DISTINCT chat_base_id) AS sum_count
FROM (
    SELECT DISTINCT ON (chat_base_id)
        chat_base_id,
        ended
    FROM denormalized_chat_messages_for_metrics
    WHERE ended >= :start::DATE AND ended < (:end::DATE + INTERVAL '1 day')
        AND chat_status = 'ENDED'
        AND (
            (
                NOT EXISTS (
                    SELECT 1
                    FROM denormalized_chat_messages_for_metrics AS m_1
                    WHERE
                        m_1.chat_base_id
                        = denormalized_chat_messages_for_metrics.chat_base_id
                        AND m_1.message_author_role = 'backoffice-user'
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM denormalized_chat_messages_for_metrics AS m_2
                    WHERE
                        m_2.chat_base_id
                        = denormalized_chat_messages_for_metrics.chat_base_id
                        AND m_2.message_event = 'taken-over'
                )
            )
            OR
            (
                EXISTS (
                    SELECT 1
                    FROM denormalized_chat_messages_for_metrics AS m_3
                    WHERE
                        m_3.chat_base_id
                        = denormalized_chat_messages_for_metrics.chat_base_id
                        AND m_3.message_author_role = 'backoffice-user'
                )
                AND EXISTS (
                    SELECT 1
                    FROM denormalized_chat_messages_for_metrics AS m_4
                    WHERE
                        m_4.chat_base_id
                        = denormalized_chat_messages_for_metrics.chat_base_id
                        AND m_4.message_event = 'taken-over'
                )
            )
        )
    ORDER BY chat_base_id ASC, timestamp DESC
) AS filtered_chats
GROUP BY time
ORDER BY time ASC;
