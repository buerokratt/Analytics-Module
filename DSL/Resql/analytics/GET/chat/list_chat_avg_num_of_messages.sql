/*
declaration:
  version: 0.1
  description: "Calculate the average number of messages per chat grouped by time period"
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
        description: "Time granularity for grouping average message counts"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Start of the grouped time period"
      - field: avg_num_of_messages
        type: number
        description: "Average number of messages per chat for the time period"
*/
WITH
    counts AS (
        SELECT
            chat_base_id,
            COUNT(*) AS num_of_messages,
            MIN(created) AS created
        FROM message
        WHERE created >= :start::DATE AND created < (:end::DATE + INTERVAL '1 day')
        GROUP BY chat_base_id
    )

SELECT
    DATE_TRUNC(:period, created) AS time,
    AVG(num_of_messages) AS avg_num_of_messages
FROM counts
GROUP BY time
ORDER BY time
