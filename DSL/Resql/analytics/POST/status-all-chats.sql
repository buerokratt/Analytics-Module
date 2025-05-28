WITH ended_chats AS (
    SELECT DISTINCT ON (chat_base_id)
        chat_base_id,
        ended AS max_ended_date
    FROM denormalized_chat_messages_for_metrics
    WHERE chat_status = 'ENDED'
      AND ended >= :start::date 
      AND ended < (:end::date + INTERVAL '1 day')
    ORDER BY chat_base_id, timestamp DESC
)
SELECT 
    DATE_TRUNC(:metric, ec.max_ended_date) AS date_time,
    dcm.message_event AS event,
    COUNT(DISTINCT dcm.chat_base_id) AS chat_count
FROM denormalized_chat_messages_for_metrics dcm
JOIN ended_chats ec ON dcm.chat_base_id = ec.chat_base_id
WHERE dcm.message_event IN (:events)
GROUP BY date_time, dcm.message_event
ORDER BY event;