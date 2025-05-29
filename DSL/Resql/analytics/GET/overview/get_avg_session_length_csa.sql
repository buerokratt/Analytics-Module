/*
declaration:
  version: 0.1
  description: "Calculate the average duration in seconds of ended chats involving both backoffice-users and end-users"
  method: get
  namespace: overview
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering chat records"
      - field: end
        type: date
        description: "End date for filtering chat records"
  response:
    fields:
      - field: avg_chat_length
        type: number
        description: "Average duration in seconds of chats that ended and involved both end-user and backoffice-user"
*/
WITH chat_durations AS (
    SELECT 
        chat_base_id,
        EXTRACT(EPOCH FROM (MAX(ended) - MIN(message_created))) AS chat_length
    FROM denormalized_chat_messages_for_metrics
    WHERE created IS NOT NULL
      AND created >= :start::date AND created < (:end::date + INTERVAL '1 day')
    GROUP BY chat_base_id
    HAVING 
        MAX(ended) IS NOT NULL
        AND SUM(CASE WHEN message_author_role = 'backoffice-user' THEN 1 ELSE 0 END) > 0
        AND SUM(CASE WHEN message_author_role = 'end-user' THEN 1 ELSE 0 END) > 0
)
SELECT COALESCE(AVG(chat_length), 0) AS avg_chat_length
FROM chat_durations;