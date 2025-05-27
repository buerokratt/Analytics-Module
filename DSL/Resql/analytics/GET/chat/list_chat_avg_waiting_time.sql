/*
declaration:
  version: 0.1
  description: "Calculate average waiting time (in minutes) for end-users before a backoffice-user response, grouped by time period"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering end-user messages"
      - field: end
        type: date
        description: "End date for filtering end-user messages"
      - field: period
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time granularity for grouping average waiting times"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Start of the grouped time period"
      - field: average_waiting_time
        type: number
        description: "Average waiting time in minutes before a response from a backoffice-user"
*/
WITH user_messages AS (
  SELECT 
    chat_base_id, 
    author_role,
    created, 
    LAG(created) OVER (PARTITION BY chat_base_id, author_role ORDER BY created) AS prev_message_time
  FROM message
  WHERE author_role = 'end-user' 
  AND created::date BETWEEN :start::date AND :end::date
),
average_waiting_time AS (
  SELECT 
    DATE_TRUNC(:period, m.created) AS time, 
    COALESCE(AVG(EXTRACT(epoch FROM (m.created - prev_message_time))::integer / 60.0), 0) AS average_waiting_time
  FROM user_messages m
  JOIN message byk
  ON m.chat_base_id = byk.chat_base_id
  AND byk.author_role = 'backoffice-user'
  GROUP BY time
)
SELECT time, average_waiting_time FROM average_waiting_time
ORDER BY time ASC;
