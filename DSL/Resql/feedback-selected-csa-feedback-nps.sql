WITH chat_csas AS (
    SELECT DISTINCT base_id,
        first_value(created) over (
            PARTITION by base_id
            ORDER BY updated
) AS created,
        last_value(customer_support_id) over (
            PARTITION by base_id
            ORDER BY updated
) AS customer_support_id,
        last_value(customer_support_display_name) over (
            PARTITION by base_id
            ORDER BY updated
) AS customer_support_display_name,
        last_value(feedback_rating) over (
            PARTITION by base_id
            ORDER BY updated
) AS feedback_rating
    FROM chat
    WHERE customer_support_id <> ''
        AND EXISTS (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
                AND message.author_role = 'backoffice-user'
)
        AND EXISTS (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
                AND message.author_role = 'end-user'
)
        AND STATUS = 'ENDED'
        AND feedback_rating IS NOT NULL
        AND created::date BETWEEN :start::date AND :end::date
        AND customer_support_id NOT IN (:excluded_csas)
)
SELECT date_trunc(:metric, created) AS date_time,
    customer_support_id,
    TRIM(customer_support_display_name) AS customer_support_display_name,
    coalesce(CAST(((
       SUM(CASE WHEN NULLIF(feedback_rating, '')::int BETWEEN 9 AND 10 THEN 1 ELSE 0 END) * 1.0 -
       SUM(CASE WHEN NULLIF(feedback_rating, '')::int BETWEEN 0 AND 6 THEN 1 ELSE 0 END)
) / COUNT(base_id) * 100) AS int), 0) AS nps
FROM chat_csas
GROUP BY date_time, customer_support_id, customer_support_display_name 
ORDER BY date_time
