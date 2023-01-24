SELECT date_trunc(:metric, chat.created) AS date_time,chat.base_id, chat.created, csas.author_id, csas.author_first_name, csas.author_last_name,
       coalesce(CAST(((
       SUM(CASE WHEN feedback_rating::int BETWEEN 9 AND 10 THEN 1 ELSE 0 END) * 1.0 -
       SUM(CASE WHEN feedback_rating::int BETWEEN 0 AND 6 THEN 1 ELSE 0 END)
       ) / COUNT(DISTINCT csas.author_id) * 100) AS int), 0) AS nps
FROM chat 
left outer join message on chat.base_id = message.chat_base_id
left outer join (SELECT distinct author_id, author_first_name, author_last_name
     FROM message
     WHERE message.author_role = 'backoffice-user'
     AND message.author_first_name is not null
     AND coalesce(TRIM(message.author_first_name), '') != ''
     and author_id not in (:excluded_csas)) as csas on message.author_id = csas.author_id
WHERE EXISTS
    (SELECT 1
     FROM message
     WHERE message.chat_base_id = chat.base_id
       AND message.author_role = 'backoffice-user')
  AND EXISTS
    (SELECT 1
     FROM message
     WHERE message.chat_base_id = chat.base_id
       AND message.author_role = 'end-user')    
  AND status = 'ENDED'
  AND feedback_rating IS NOT null
  and coalesce(TRIM(message.author_id), '') != ''
  and coalesce(TRIM(message.author_id), '') != 'botname'
  and csas.author_first_name is not null
  AND chat.created::date BETWEEN :start::date AND :end::date
  group by chat.base_id, chat.created,csas.author_id,csas.author_first_name,csas.author_last_name