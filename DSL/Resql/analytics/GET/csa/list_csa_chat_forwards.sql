/*
declaration:
  version: 0.1
  description: "Count forwarded, received, and externally forwarded chats over time excluding chats from the bot"
  method: get
  namespace: csa
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering chat records"
      - field: end
        type: date
        description: "End date for filtering chat records"
      - field: metric
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time granularity for grouping results"
      - field: botname
        type: string
        description: "Bot name to exclude from received chat filtering"
  response:
    fields:
      - field: date_time
        type: timestamp
        description: "Truncated timestamp representing the grouped period"
      - field: forwarded_chats
        type: integer
        description: "Count of chats forwarded from CSAs during the period"
      - field: received_chats
        type: integer
        description: "Count of chats received by CSAs during the period"
      - field: forwarded_externally
        type: integer
        description: "Count of chats forwarded to an external system during the period"
*/
WITH chat_metrics AS (
  SELECT 
    date_trunc(:metric, created) AS date_time,
    COUNT(DISTINCT CASE
      WHEN message_forwarded_from_csa IS NOT NULL 
      AND message_forwarded_from_csa <> '' 
      AND message_forwarded_from_csa <> 'null'
      THEN chat_base_id 
    END) AS forwarded_chats,
    COUNT(DISTINCT CASE
      WHEN message_forwarded_to_csa IS NOT NULL 
      AND message_forwarded_to_csa <> '' 
      AND message_forwarded_to_csa <> 'null'
      THEN chat_base_id 
    END) AS received_chats,
    COUNT(DISTINCT CASE
      WHEN external_id IS NOT NULL 
      AND external_id <> '' 
      AND external_id <> 'null'
      THEN chat_base_id 
    END) AS forwarded_externally
  FROM denormalized_chat_messages_for_metrics
  WHERE created::date BETWEEN :start::date AND :end::date
  AND received_from <> :botname
  GROUP BY date_time
)

SELECT 
  date_time,
  COALESCE(forwarded_chats, 0) AS forwarded_chats,
  COALESCE(received_chats, 0) AS received_chats,
  COALESCE(forwarded_externally, 0) AS forwarded_externally
FROM chat_metrics
ORDER BY date_time ASC;