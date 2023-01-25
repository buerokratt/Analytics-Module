SELECT DISTINCT chat.base_id,
       first_value(chat.created) over (
       PARTITION by chat.base_id
       ORDER BY chat.updated
       ) AS date_time,
       message.event
  FROM chat join message on chat.base_id = message.chat_base_id
  AND status = 'ENDED'
  AND message.event IN (:events)
  AND chat.created::date BETWEEN :start::date AND :end::date
  ORDER BY date_time
