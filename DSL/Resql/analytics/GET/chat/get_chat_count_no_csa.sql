/*
declaration:
  version: 0.1
  description: "Count chats that included both end-user and chatbot messages but no backoffice-user messages"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering chat messages"
      - field: end
        type: date
        description: "End date for filtering chat messages"
  response:
    fields:
      - field: count
        type: integer
        description: "Number of chats with both end-user and chatbot messages and no backoffice-user involvement"
*/
SELECT COUNT(DISTINCT chat_base_id)
FROM (
    SELECT 
        chat_base_id
    FROM denormalized_chat_messages_for_metrics
    WHERE created::date BETWEEN :start::date AND :end::date
    GROUP BY chat_base_id
    HAVING 
        SUM(CASE WHEN message_author_role = 'end-user' THEN 1 ELSE 0 END) > 0
        AND SUM(CASE WHEN message_author_role = 'chatbot' THEN 1 ELSE 0 END) > 0
        AND SUM(CASE WHEN message_author_role = 'backoffice-user' THEN 1 ELSE 0 END) = 0
) AS eligible_chats;