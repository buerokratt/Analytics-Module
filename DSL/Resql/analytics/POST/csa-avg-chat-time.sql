WITH distinct_chats AS (
  SELECT DISTINCT ON (chat_base_id, message_author_id)
    chat_base_id AS base_id, 
    date_trunc(:metric, created) AS date_time, 
    message_author_id AS author_id,
    age(last_message_timestamp, first_message_timestamp) AS chat_length
  FROM denormalized_chat_messages_for_metrics
  WHERE 
    created IS NOT NULL 
    AND created::date BETWEEN :start::date AND :end::date
    AND message_author_role IN ('backoffice-user', 'end-user')
    AND message_author_id IS NOT NULL
    AND message_author_id <> ''
    AND message_author_id <> 'null'
    AND message_author_id NOT in (:excluded_csas)
  ORDER BY chat_base_id, message_author_id, timestamp DESC
)

SELECT
    date_time,
    MAX(author_id) AS customer_support_id,
    ROUND(EXTRACT(epoch FROM COALESCE(AVG(chat_length), '0 seconds'::interval)) / 60) AS avg_min
FROM distinct_chats
GROUP BY date_time, author_id;