/*
declaration:
  version: 0.1
  description: "Calculate average chatbot response time based on time elapsed since previous non-chatbot message"
  method: get
  namespace: byk
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering messages"
      - field: end
        type: date
        description: "End date for filtering messages"
      - field: period
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time period for grouping the average response time"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Truncated timestamp for the grouped time period"
      - field: avg_response_time
        type: number
        description: "Average chatbot response time in seconds for the time period"
*/
WITH
    chatbot_messages AS (
        SELECT
            created,
            (
                SELECT MAX(created)
                FROM message AS m_2
                WHERE
                    m_2.author_role <> 'buerokratt'
                    AND m_2.created < m.created
                    AND m_2.chat_base_id = m.chat_base_id
            ) AS previous_message_time
        FROM message AS m
        WHERE created >= :start::DATE
          AND created < (:end::DATE + INTERVAL '1 day')
          AND author_role = 'buerokratt'
    )

SELECT
    DATE_TRUNC(:period, created) AS time,
    AVG(
        EXTRACT(EPOCH FROM created) - EXTRACT(EPOCH FROM previous_message_time)
    ) AS avg_response_time
FROM chatbot_messages
WHERE previous_message_time IS NOT NULL
GROUP BY time
ORDER BY time;
