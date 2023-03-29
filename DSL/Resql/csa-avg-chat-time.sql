WITH chats AS
  (SELECT DISTINCT base_id,
                   date_trunc(:metric, created) AS date_time
   FROM chat
   WHERE created::date BETWEEN :start::date AND :end::date
     AND EXISTS
       (SELECT 1
        FROM message
        WHERE message.chat_base_id = chat.base_id
          AND message.author_role = 'backoffice-user' )
     AND EXISTS
       (SELECT 1
        FROM message
        WHERE message.chat_base_id = chat.base_id
          AND message.author_role = 'end-user' ) ),
     chat_lengths AS
  (SELECT chat_base_id,
          age(MAX(created), MIN(created)) AS chat_length
   FROM message
   JOIN chats ON message.chat_base_id = chats.base_id
   GROUP BY message.chat_base_id)
SELECT date_time,
       ROUND(EXTRACT(epoch
                     FROM COALESCE(AVG(chat_length), '0 seconds'::interval)) / 60) AS avg_min
FROM chat_lengths
JOIN chats ON chats.base_id = chat_lengths.chat_base_id
GROUP BY date_time
