/*
declaration:
  version: 0.1
  description: "Calculate average number of intents per chat over time for a given period"
  method: get
  namespace: byk
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering chat messages"
      - field: end
        type: date
        description: "End date for filtering chat messages"
      - field: period
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time period for date truncation (e.g., day, week, month)"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Truncated timestamp representing the period bucket"
      - field: avg_num_of_intent
        type: number
        description: "Average number of intents per chat in the given time period"
*/
WITH chat_intent_counts AS (
    SELECT 
        COUNT(intent) AS intent_count,
        MIN(created) AS created
    FROM message m
    WHERE created >= :start::date AND created < (:end::date + INTERVAL '1 day')
    AND intent IS NOT NULL
    GROUP BY chat_base_id
)
SELECT
    DATE_TRUNC(:period, created) AS time,
    COALESCE(AVG(intent_count), 0) AS avg_num_of_intent
FROM chat_intent_counts
GROUP BY time
ORDER BY time
