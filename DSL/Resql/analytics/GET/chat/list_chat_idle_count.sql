/*
declaration:
  version: 0.1
  description: "Count chats that entered IDLE status over time"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering IDLE chats"
      - field: end
        type: date
        description: "End date for filtering IDLE chats"
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
        description: "Number of chats with IDLE status in the period"
*/
SELECT
    DATE_TRUNC(:period, created) AS time,
    COUNT(DISTINCT base_id)
FROM chat
WHERE created >= :start::date AND created < (:end::date + INTERVAL '1 day')
AND status = 'IDLE'
GROUP BY time
ORDER BY time
