/*
declaration:
  version: 0.1
  description: "Calculate the percentage of chatbot messages that were correctly understood, grouped by time period"
  method: get
  namespace: byk
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering chatbot messages"
      - field: end
        type: date
        description: "End date for filtering chatbot messages"
      - field: period
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time granularity for grouping the percentage"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Truncated timestamp representing the time bucket"
      - field: percentage_correctly_understood
        type: number
        description: "Percentage of chatbot messages correctly understood in the given time period"
*/
SELECT
    DATE_TRUNC(:period, created) as time,
    (
        SUM(
            CASE
                WHEN author_role != 'chatbot'
                AND event != 'not-confident'
                THEN 1
                ELSE 0
            END
        )::float / COUNT(*)::float 
    ) * 100 AS percentage_correctly_understood
FROM message 
WHERE created::date BETWEEN :start::date AND :end::date
AND author_role = 'chatbot'
GROUP BY time
ORDER BY time
