WITH chat_csas AS (
    SELECT DISTINCT base_id,
    first_value(created) over (
            PARTITION by base_id
            ORDER BY updated
            ) AS created,
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
)
SELECT date_trunc(:metric, created) AS date_time,
    coalesce(CAST(((
       SUM(CASE WHEN feedback_rating BETWEEN 9 AND 10 THEN 1 ELSE 0 END) * 1.0 -
       SUM(CASE WHEN feedback_rating BETWEEN 0 AND 6 THEN 1 ELSE 0 END)
       ) / COUNT(base_id) * 100) AS int), 0) AS nps
FROM chat_csas
GROUP BY date_time
ORDER BY date_time
