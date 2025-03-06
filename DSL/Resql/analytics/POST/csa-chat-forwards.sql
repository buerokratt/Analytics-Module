WITH botname AS (
  SELECT "value"
  FROM "configuration"
  WHERE "key" = 'bot_institution_id'
  ORDER BY id DESC
  LIMIT 1
),
chatsList AS (
  SELECT
    chat.created AS created,
    chat.base_id AS base_id,
    message.forwarded_from_csa AS forwarded_from_csa,
    message.forwarded_to_csa AS forwarded_to_csa
  FROM chat
  JOIN message ON chat.base_id = message.chat_base_id
  CROSS JOIN botname
  WHERE chat.created::date BETWEEN :start::date AND :end::date
  AND chat.received_from <> botname.value
),
forwardedChats AS (
  SELECT 
    date_trunc(:metric, created) AS date_time,
    COUNT(DISTINCT base_id) AS forwarded_chats
  FROM chatsList
  WHERE forwarded_from_csa IS NOT NULL
  AND forwarded_from_csa <> ''
  AND forwarded_from_csa <> 'null'
  GROUP BY date_time
),
receivedChats AS (
  SELECT 
    date_trunc(:metric, created) AS date_time,
    COUNT(DISTINCT base_id) AS received_chats
  FROM chatsList
  WHERE forwarded_to_csa IS NOT NULL
  AND forwarded_to_csa <> ''
  AND forwarded_to_csa <> 'null'
  GROUP BY date_time
),
externalChats AS (
  SELECT date_trunc(:metric, created) AS date_time,
        COUNT(DISTINCT base_id) AS forwarded_externally
  FROM chat
  WHERE created::date BETWEEN :start::date AND :end::date
  AND external_id IS NOT NULL
  AND external_id <> ''
  AND external_id <> 'null'
  GROUP BY 1
),
chatForwards AS (
  SELECT COALESCE(f.date_time, r.date_time, e.date_time) AS time_date,
        COALESCE(f.forwarded_chats, 0) AS forwarded_chats,
        COALESCE(r.received_chats, 0) AS received_chats,
        COALESCE(e.forwarded_externally, 0) AS forwarded_externally
  FROM forwardedChats f
  FULL JOIN receivedChats r ON f.date_time = r.date_time
  FULL JOIN externalChats e ON f.date_time = e.date_time
),
finalResult AS (
  SELECT time_date AS date_time,
        SUM(forwarded_chats) AS forwarded_chats,
        SUM(received_chats) AS received_chats,
        SUM(forwarded_externally) AS forwarded_externally
  FROM chatForwards
  GROUP BY time_date
)
SELECT date_time,
       forwarded_chats,
       received_chats,
       forwarded_externally
FROM finalResult
ORDER BY date_time ASC;
