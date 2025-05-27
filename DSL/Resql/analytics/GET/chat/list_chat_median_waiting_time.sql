/*
declaration:
  version: 0.1
  description: "Calculate the median waiting time (in minutes) for end-users before receiving a response from a backoffice-user, grouped by time period"
  method: get
  namespace: chat
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
        description: "Time granularity for grouping median waiting times"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Start of the grouped time period"
      - field: median_waiting_time
        type: number
        description: "Median waiting time in minutes before a response from a backoffice-user"
*/
WITH waiting_times AS (
    SELECT 
        DATE_TRUNC(:period, m1.created) AS time,
        m1.chat_base_id,
        (m2.created - m1.created) AS waiting_time
    FROM message m1
    JOIN message m2
    ON m1.chat_base_id = m2.chat_base_id
    WHERE m1.author_role = 'end-user'
    AND m2.author_role = 'backoffice-user'
    AND m2.created > m1.created
    AND m1.created::date BETWEEN :start::date AND :end::date
)
SELECT 
    time, 
    ROUND(EXTRACT(epoch FROM (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY waiting_time)))::numeric / 60, 2) AS median_waiting_time
FROM waiting_times
GROUP BY time
ORDER BY time
