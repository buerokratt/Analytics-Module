/*
declaration:
  version: 0.1
  description: "Calculate the average time (in minutes) it takes for a CSA to be assigned after chat creation"
  method: get
  namespace: csa
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering chat assignments"
      - field: end
        type: date
        description: "End date for filtering chat assignments"
      - field: metric
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time granularity for grouping results"
      - field: botname
        type: string
        description: "Identifier of the bot to exclude from CSA assignment"
  response:
    fields:
      - field: date_time
        type: timestamp
        description: "Truncated timestamp representing the grouped period"
      - field: avg_min
        type: number
        description: "Average number of minutes until a CSA is assigned after chat creation"
*/
WITH customer_support_changes AS (
    SELECT base_id,
        customer_support_id,
        updated,
        date_trunc(:metric, created) AS date_time,
        lag(customer_support_id) over (
            PARTITION by base_id
            ORDER BY updated
        ) AS prev_support_id,
        lag(updated) over (
            PARTITION by base_id
            ORDER BY updated
        ) AS prev_updated
    FROM chat
    WHERE created >= :start::date AND created < (:end::date + INTERVAL '1 day')
)
SELECT date_time, ROUND(COALESCE(
        AVG(
            extract(
                epoch FROM (updated - prev_updated)
            )
        ) / 60), 2
    ) AS avg_min
FROM customer_support_changes
WHERE prev_support_id = ''
    AND customer_support_id <> ''
    AND customer_support_id <> 'chatbot'
GROUP BY date_time;
