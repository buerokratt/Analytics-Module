/*
declaration:
  version: 0.1
  description: "Calculate the average chatbot response time (in seconds) to end-user messages within a specified period"
  method: get
  namespace: overview
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering message interactions"
      - field: end
        type: date
        description: "End date for filtering message interactions"
  response:
    fields:
      - field: avg
        type: number
        description: "Average response time in seconds from end-user to chatbot"
*/
WITH
    chat_responses AS (
        SELECT
            dcm.chat_base_id,
            dcm.message_id,
            dcm.message_author_role,
            dcm.message_created,
            LAG(dcm.message_created) OVER (
                PARTITION BY dcm.chat_base_id
                ORDER BY dcm.message_created
            ) AS prev_created,
            LAG(dcm.message_author_role) OVER (
                PARTITION BY dcm.chat_base_id
                ORDER BY dcm.message_created
            ) AS prev_author
        FROM (
        -- Get the most recent version of each unique message
            SELECT DISTINCT ON (chat_base_id, message_id)
                chat_base_id,
                message_id,
                message_author_role,
                message_created,
                created
            FROM denormalized_chat_messages_for_metrics
            WHERE 
                created IS NOT NULL
                AND created >= :start::DATE
                AND created < (:end::DATE + INTERVAL '1 day')
            ORDER BY chat_base_id ASC, message_id ASC, timestamp DESC
        ) AS dcm
    )

SELECT
    COALESCE(AVG(
        EXTRACT(
            EPOCH
            FROM (message_created - prev_created)
        )
    ), 0)
FROM chat_responses
WHERE
    message_author_role = 'buerokratt'
    AND prev_author = 'end-user'
