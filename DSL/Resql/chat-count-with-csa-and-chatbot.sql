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
SELECT COALESCE(chatbot_chats.time, csa_chats.time) AS time, COALESCE(chatbot_chats.count, 0) + COALESCE(csa_chats.count, 0) AS sum_count
FROM chatbot_chats
FULL JOIN csa_chats ON chatbot_chats.time = csa_chats.time
ORDER BY time;
