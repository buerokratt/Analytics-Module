WITH chats AS (
    SELECT base_id,
        date_trunc(:group_period, created) AS created
    FROM chat
    WHERE EXISTS (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
                AND message.author_role = 'end-user'
        )
        AND NOT EXISTS (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
                AND message.author_role = 'backoffice-user'
        )
        AND EXISTS (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
                AND message.author_role = 'chatbot'
        )
        AND chat.created >= date_trunc(
            :group_period,
            current_date - concat('1 ', :group_period)::INTERVAL
        )
)
SELECT timescale.created AS created,
    COUNT(DISTINCT base_id) AS metric_value
FROM (
        SELECT date_trunc(
                :group_period,
                generate_series(
                    current_date - concat('1 ', :group_period)::INTERVAL,
                    NOW(),
                    concat('1 ', :group_period)::INTERVAL
                )
            ) AS created
    ) AS timescale
    LEFT JOIN chats ON chats.created = timescale.created
GROUP BY 1
ORDER BY 1 DESC
