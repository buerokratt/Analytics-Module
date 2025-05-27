WITH chat_end_dates AS (
    SELECT chat_base_id, MAX(ended) AS max_ended_date
    FROM denormalized_chat_messages_for_metrics
    GROUP BY chat_base_id
)
SELECT 
    DATE_TRUNC(:metric, (select max_ended_date from chat_end_dates  where chat_base_id = dcm.chat_base_id)) AS date_time,
    dcm.message_event AS event,
    COUNT(DISTINCT dcm.chat_base_id) AS chat_count
FROM denormalized_chat_messages_for_metrics dcm
WHERE dcm.message_event::event_type IN (:events)
 AND dcm.message_author_role = 'backoffice-user'
 AND EXISTS (
      SELECT 1
      FROM denormalized_chat_messages_for_metrics dcm_status
      WHERE dcm_status.chat_base_id = dcm.chat_base_id
        AND dcm_status.chat_status = 'ENDED'
        AND chat.ended::date BETWEEN :start::date AND :end::date
  )
GROUP BY date_time, dcm.message_event
ORDER BY event;