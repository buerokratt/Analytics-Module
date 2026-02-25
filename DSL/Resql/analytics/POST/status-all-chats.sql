WITH latest_messages AS (
    SELECT DISTINCT ON (message.chat_base_id)
        message.chat_base_id,
        message.event
    FROM message
    WHERE message.event IN (:events)
    ORDER BY message.chat_base_id, message.created DESC
)
SELECT
    date_trunc(:metric, chat.ended) AS date_time,
    lm.event AS event,
    COUNT(DISTINCT chat.base_id)
FROM chat
    JOIN latest_messages lm
        ON chat.base_id = lm.chat_base_id
WHERE chat.status = 'ENDED'
    AND (
        array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
        OR chat.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
    )
    AND (
        :showTest = TRUE
        OR chat.test = FALSE
    )
    AND chat.ended::timestamptz BETWEEN :start::timestamptz AND :end::timestamptz
GROUP BY date_time, event
ORDER BY event;
