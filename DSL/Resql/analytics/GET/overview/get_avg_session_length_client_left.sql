/*
declaration:
  version: 0.1
  description: "Calculate the average chat session duration in seconds for chats that include at least one end-user message and end with a 'client-left' event"
  method: get
  namespace: overview
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering chat sessions"
      - field: end
        type: date
        description: "End date for filtering chat sessions"
  response:
    fields:
      - field: avg
        type: number
        description: "Average chat session duration in seconds"
*/
WITH
    chat_stats AS (
        SELECT
            chat_base_id,
            MIN(message_created) AS first_message,
            MAX(message_created) FILTER (
                WHERE message_event = 'client-left'
            ) AS client_left_time,
            BOOL_OR(message_author_role = 'end-user') AS has_end_user
        FROM chat.denormalized_chat_messages_for_metrics
        WHERE 
            created IS NOT NULL
            AND created >= :start::DATE
            AND created < (:end::DATE + INTERVAL '1 day')
        GROUP BY chat_base_id
        HAVING BOOL_OR(message_author_role = 'end-user') = TRUE
    ),

    chat_lengths AS (
        SELECT
            chat_base_id,
            EXTRACT(EPOCH FROM (client_left_time - first_message)) AS chat_length
        FROM chat_stats
        WHERE client_left_time IS NOT NULL
    )

SELECT COALESCE(AVG(chat_length), 0) AS avg_chat_length_seconds
FROM chat_lengths;
