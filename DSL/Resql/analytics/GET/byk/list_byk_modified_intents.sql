/*
declaration:
  version: 0.1
  description: "Return frequency of intents that were modified during the selected period, grouped by time"
  method: get
  namespace: byk
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering messages and modified intents"
      - field: end
        type: date
        description: "End date for filtering messages and modified intents"
      - field: period
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time granularity to group intent usage"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Start of the time bucket for modified intent usage"
      - field: intent
        type: string
        description: "Name of the intent"
      - field: intent_count
        type: integer
        description: "Number of times the modified intent was used during the period"
*/
WITH modified_intent_counts AS (
    SELECT 
        m.intent AS intent,
        COUNT(intent) AS intent_count,
        MIN(m.created) AS created
    FROM message m
    JOIN intents i ON i.base_id = m.intent_base_id
    WHERE m.created::date BETWEEN :start::date AND :end::date
    AND i.modified BETWEEN :start::date AND :end::date
    AND m.intent IS NOT NULL
    GROUP BY m.intent
    ORDER BY intent_count DESC
)
SELECT
    DATE_TRUNC(:period, created) AS time,
    intent,
    intent_count
FROM modified_intent_counts
GROUP BY time, intent, intent_count
ORDER BY time, intent_count
