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
WITH chatbot_messages AS (
    SELECT
        created,
        (
            SELECT MAX(created) 
            FROM message m2 
            WHERE m2.author_role <> 'chatbot' 
            AND m2.created < m.created 
            AND m2.chat_base_id = m.chat_base_id
        ) AS previous_message_time
    FROM message m
    WHERE created::date BETWEEN :start::date AND :end::date
    AND author_role = 'chatbot'
)
SELECT 
    DATE_TRUNC(:period, created) AS time,
    AVG(
        EXTRACT(EPOCH FROM created) - EXTRACT(EPOCH FROM previous_message_time)
    ) AS avg_response_time
FROM chatbot_messages
WHERE previous_message_time IS NOT NULL
GROUP BY time
ORDER BY time
