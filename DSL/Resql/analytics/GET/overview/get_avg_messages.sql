/*
declaration:
  version: 0.1
  description: "Calculate the average number of messages per chat for chats that include at least one end-user message"
  method: get
  namespace: overview
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
      - field: avg_messages_per_chat
        type: number
        description: "Average number of messages per chat within the specified period"
*/
WITH
    chat_stats AS (
        SELECT
            chat_base_id,
            COUNT(DISTINCT message_base_id) AS message_count
        FROM denormalized_chat_messages_for_metrics
        WHERE created >= :start::DATE AND created < (:end::DATE + INTERVAL '1 day')
        GROUP BY chat_base_id
        HAVING BOOL_OR(message_author_role = 'end-user') = true
    )

SELECT COALESCE(AVG(message_count), 0) AS avg_messages_per_chat
FROM chat_stats;
