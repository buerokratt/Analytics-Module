SELECT date_trunc(:metric, chat.created) AS date_time,
       max("user".display_name) AS customer_support_display_name,
       max("user".id_code) AS customer_support_id,
       COUNT(DISTINCT chat.base_id)
FROM chat
JOIN message ON message.chat_base_id = chat.base_id
left join "user"
on "user".id_code = message.author_id
WHERE message.author_role IN ('backoffice-user', 'end-user')
  AND message.author_id IS NOT NULL
  AND message.author_id <> ''
  AND message.author_id <> 'null'
  AND "user".id_code NOT IN (:excluded_csas)
  AND chat.created::date BETWEEN :start::date AND :end::date
GROUP BY date_time, message.author_id;
