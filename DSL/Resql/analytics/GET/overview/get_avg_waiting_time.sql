/*
declaration:
  version: 0.1
  description: "Calculate average waiting time in seconds between chatbot leaving and customer support taking over"
  method: get
  namespace: overview
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering chat creation"
      - field: end
        type: date
        description: "End date for filtering chat creation"
      - field: botname
        type: string
        description: "Name of the bot to exclude from customer support assignments"
  response:
    fields:
      - field: avg_waiting_time_seconds
        type: number
        description: "Average number of seconds between previous empty support and new support assigned"
*/
WITH
    customer_support_changes AS (
        SELECT
            base_id,
            customer_support_id,
            updated,
            LAG(customer_support_id) OVER (
                PARTITION BY base_id
                ORDER BY updated
            ) AS prev_support_id,
            LAG(updated) OVER (
                PARTITION BY base_id
                ORDER BY updated
            ) AS prev_updated
        FROM chat.chat
        WHERE created >= :start::dateAND created < (:end::DATE + INTERVAL '1 day')
    )

SELECT
    COALESCE(
        AVG(
            EXTRACT(
                EPOCH
                FROM (updated - prev_updated)
            )
        ),
        0
    ) AS avg_waiting_time_seconds
FROM customer_support_changes
WHERE
    prev_support_id = ''
    AND customer_support_id <> ''
    AND customer_support_id <> 'chatbot';
