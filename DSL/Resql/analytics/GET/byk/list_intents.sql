/*
declaration:
  version: 0.1
  description: "Count the number of unique messages per intent within a specified date range"
  method: get
  namespace: byk
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering messages"
      - field: end
        type: date
        description: "End date for filtering messages"
  response:
    fields:
      - field: intent
        type: string
        description: "Name of the intent"
      - field: count
        type: integer
        description: "Number of unique messages associated with the intent"
*/
SELECT
    intent,
    COUNT(DISTINCT base_id) AS count
FROM chat.message
WHERE intent IS NOT NULL
  AND created >= :start::DATE
  AND created < (:end::DATE + INTERVAL '1 day')
GROUP BY intent
