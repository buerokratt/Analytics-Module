WITH user_messages AS (
  SELECT DISTINCT ON (chat_base_id, message_created)
    chat_base_id, 
    message_created AS created,
    LAG(message_created) OVER (PARTITION BY chat_base_id ORDER BY message_created) AS prev_message_time
  FROM denormalized_chat_messages_for_metrics dcm1
  WHERE message_author_role = 'end-user'
    AND message_created::date BETWEEN :start::date AND :end::date
    AND EXISTS (
      SELECT 1
      FROM denormalized_chat_messages_for_metrics dcm2
      WHERE dcm1.chat_base_id = dcm2.chat_base_id
      AND dcm2.message_author_role = 'backoffice-user'
    )
    AND EXISTS (
      SELECT 1
      FROM denormalized_chat_messages_for_metrics dcm3
      WHERE dcm1.chat_base_id = dcm3.chat_base_id
      AND (
        dcm3.message_event LIKE '%contact-information-fulfilled' OR
        (dcm3.end_user_email IS NOT NULL AND dcm3.end_user_email <> '') OR
        (dcm3.end_user_phone IS NOT NULL AND dcm3.end_user_phone <> '')
      )
    )
  ORDER BY chat_base_id, message_created
),
waiting_times AS (
  SELECT
    chat_base_id,
    MIN(created) AS created, 
    EXTRACT(epoch FROM MAX(created - prev_message_time))::INT AS waiting_time_seconds
  FROM user_messages
  WHERE prev_message_time IS NOT NULL
  GROUP BY chat_base_id
)
SELECT 
  DATE_TRUNC(:period, created) AS time, 
  COUNT(*) AS long_waiting_time
FROM waiting_times
WHERE waiting_time_seconds > :threshold_seconds
GROUP BY time
ORDER BY time;