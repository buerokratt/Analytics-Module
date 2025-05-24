WITH FinalData AS (
    SELECT DISTINCT ON (chat_base_id)
        date_trunc(:metric, created) AS date_time,
        chat_base_id,
        message_author_id,
        message_author_display_name,
        message_author_user_first_name,
        message_author_user_last_name,
        message_author_id AS id_code
    FROM denormalized_chat_messages_for_metrics
    WHERE message_author_role IN ('backoffice-user', 'end-user')
      AND message_author_id IS NOT NULL
      AND message_author_id <> ''
      AND message_author_id <> 'null'
      AND created::date BETWEEN :start::date AND :end::date
      AND message_author_id NOT IN (:excluded_csas)
    ORDER BY chat_base_id, timestamp DESC
)
SELECT
    date_time,
    MAX(message_author_display_name) AS customer_support_display_name,
    MAX(id_code) AS customer_support_id,
    MAX(CONCAT(message_author_user_first_name, ' ', message_author_user_last_name)) AS customer_support_full_name,
    COUNT(DISTINCT chat_base_id) AS count
FROM FinalData
GROUP BY date_time, message_author_id;