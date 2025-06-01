/*
declaration:
  version: 0.1
  description: "Calculate the average duration in seconds of chats involving only end-user and chatbot, excluding backoffice-user"
  method: get
  namespace: overview
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: avg_chat_length
        type: number
        description: "Average duration in seconds of chats involving only chatbot and end-user"
*/
WITH
    chat_durations AS (
        SELECT
            chat_base_id,
            EXTRACT(
                EPOCH FROM (MAX(message_created) - MIN(message_created))
            ) AS chat_length
        FROM chat.denormalized_chat_messages_for_metrics
        WHERE 
            created IS NOT NULL
            AND created >= :start::DATE
            AND created < (:end::DATE + INTERVAL '1 day')
        GROUP BY chat_base_id
        HAVING
            SUM(CASE WHEN message_author_role = 'end-user' THEN 1 ELSE 0 END) > 0
            AND SUM(CASE WHEN message_author_role = 'buerokratt' THEN 1 ELSE 0 END) > 0
            AND SUM(CASE WHEN message_author_role = 'backoffice-user' THEN 1 ELSE 0 END)
            = 0
    )

SELECT COALESCE(AVG(chat_length), 0) AS avg_chat_length
FROM chat_durations;
