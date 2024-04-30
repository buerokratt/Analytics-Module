WITH chatbot_chats AS (
    SELECT 
        DATE_TRUNC(:period, created) AS time,
        COUNT(DISTINCT base_id) AS count
    FROM chat
    WHERE created::date BETWEEN :start::date AND :end::date
    AND NOT EXISTS (
        SELECT 1
        FROM message
        WHERE message.chat_base_id = chat.base_id
        AND message.author_role = 'backoffice-user'
    )
    GROUP BY time
),
csa_chats AS (
    SELECT
        DATE_TRUNC(:period, created) AS time,
        COUNT(DISTINCT base_id) AS count
    FROM chat
    WHERE created::date BETWEEN :start::date AND :end::date
    AND EXISTS (
        SELECT 1
        FROM message
        WHERE message.chat_base_id = chat.base_id
        AND message.author_role = 'backoffice-user'
    )
    GROUP BY time
)
SELECT time, SUM(count) AS sum_count
FROM (
    SELECT time, count FROM chatbot_chats
    UNION ALL
    SELECT time, count FROM csa_chats
) AS combined_chats
GROUP BY time
ORDER BY time ASC;
