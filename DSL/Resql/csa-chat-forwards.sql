WITH botname AS (
    SELECT "value"
    FROM "configuration"
    WHERE "key" = 'bot_institution_id'
    LIMIT 1
), f_chats AS (
  SELECT date_trunc(:metric, chat.created) AS date_time,
         COUNT(DISTINCT chat.base_id) AS forwarded_chats
  FROM chat join message
  on chat.base_id = message.chat_base_id
  join "user" 
  on message.forwarded_from_csa = "user".id_code
  WHERE chat.created::date BETWEEN :start::date AND :end::date
    AND message.forwarded_from_csa IS NOT null
    AND message.forwarded_from_csa <> ''
    AND fmessage.orwarded_from_csa <> 'null'
    AND chat.received_from <> (
      SELECT "value"
      FROM botname
    )
  GROUP BY date_time, "user".id_code
), r_chats AS (  
  SELECT date_trunc(:metric, chat.created) AS date_time,
         COUNT(DISTINCT chat.base_id) AS received_chats
  FROM chat join message
  on chat.base_id = message.chat_base_id
  join "user" 
  on message.forwarded_to_csa = "user".id_code
  WHERE chat.created::date BETWEEN :start::date AND :end::date
    AND message.forwarded_to_csa IS NOT null
    AND message.forwarded_to_csa <> ''
    AND message.forwarded_to_csa <> 'null'
    AND chat.received_from <> (
      SELECT "value"
      FROM botname
    )
  GROUP BY date_time, "user".id_code
), e_chats AS (
  SELECT date_trunc(:metric, created) AS date_time,
         COUNT(DISTINCT base_id) AS forwarded_externally
  FROM chat
  WHERE created::date BETWEEN :start::date AND :end::date
    AND external_id IS NOT null
    AND external_id != ''
    AND external_id != 'null'
  GROUP BY 1
), chat_forwards AS (
  SELECT COALESCE(f.date_time, r.date_time, e.date_time) AS time_date,
         COALESCE(f.forwarded_chats, 0) AS forwarded_chats,
         COALESCE(r.received_chats, 0) AS received_chats,
         COALESCE(e.forwarded_externally, 0) AS forwarded_externally
  FROM f_chats f
  FULL JOIN r_chats r ON f.date_time = r.date_time
  FULL JOIN e_chats e ON f.date_time = e.date_time
), final_result AS (
  SELECT time_date AS date_time,
         SUM(forwarded_chats) AS forwarded_chats,
         SUM(received_chats) AS received_chats,
         SUM(forwarded_externally) AS forwarded_externally
  FROM chat_forwards
  GROUP BY time_date
)
SELECT date_time, forwarded_chats, received_chats, forwarded_externally
FROM final_result
ORDER BY date_time;
