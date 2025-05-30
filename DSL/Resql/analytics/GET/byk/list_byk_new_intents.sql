/*
declaration:
  version: 0.1
  description: "Return frequency of newly created intents used in messages during the selected period, grouped by time"
  method: get
  namespace: byk
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering messages and newly created intents"
      - field: end
        type: date
        description: "End date for filtering messages and newly created intents"
      - field: period
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time granularity to group intent usage"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Start of the time bucket for newly created intent usage"
      - field: intent
        type: string
        description: "Name of the newly created intent"
      - field: intent_count
        type: integer
        description: "Number of times the newly created intent was used during the period"
*/
WITH
    new_intent_counts AS (
        SELECT
            m.intent,
            COUNT(intent) AS intent_count,
            MIN(m.created) AS created
        FROM message AS m
            INNER JOIN intents AS i ON m.intent_base_id = i.base_id
        WHERE (m.created >= :start::DATE AND m.created < (:end::DATE + INTERVAL '1 day'))
          AND (i.modified >= :start::DATE AND i.modified < (:end::DATE + INTERVAL '1 day'))
          AND m.intent IS NOT NULL
        GROUP BY m.intent
        ORDER BY intent_count DESC
    )

SELECT
    DATE_TRUNC(:period, created) AS time,
    intent,
    intent_count
FROM new_intent_counts
GROUP BY time, intent, intent_count
ORDER BY time, intent_count
