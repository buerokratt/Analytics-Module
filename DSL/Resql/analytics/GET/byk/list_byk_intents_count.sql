/*
declaration:
  version: 0.1
  description: "Return frequency of each intent over time for messages within a given date range"
  method: get
  namespace: byk
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering message records"
      - field: end
        type: date
        description: "End date for filtering message records"
      - field: period
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time interval to group intent counts by"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Start of the time bucket for intent occurrence"
      - field: intent
        type: string
        description: "Intent name"
      - field: intent_count
        type: integer
        description: "Number of times the intent occurred during the time period"
*/
WITH
    chat_intent_counts AS (
        SELECT
            intent,
            COUNT(intent) AS intent_count,
            MIN(created) AS created
        FROM message
        WHERE created >= :start::DATE
          AND created < (:end::DATE + INTERVAL '1 day')
          AND intent IS NOT NULL
        GROUP BY intent
        ORDER BY intent_count DESC
    )

SELECT
    DATE_TRUNC(:period, created) AS time,
    intent,
    intent_count
FROM chat_intent_counts
GROUP BY time, intent, intent_count
ORDER BY time, intent_count
