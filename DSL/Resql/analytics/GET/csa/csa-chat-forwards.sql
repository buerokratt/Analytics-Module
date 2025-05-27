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