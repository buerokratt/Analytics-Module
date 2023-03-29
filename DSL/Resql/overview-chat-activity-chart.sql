WITH chat_stats AS (
    SELECT date_trunc('hour', created) AS created,
        base_id,
        (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
                AND "event" = 'answered'
        ) AS answered,
        (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
                AND "event" = 'client-left'
        ) AS not_answered,
        (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
                AND "event" = 'hate-speech'
        ) AS hate_speech,
        (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
                AND "event" = 'terminated'
        ) AS TERMINATED,
        (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
                AND "event" = 'to-contact'
        ) AS to_contact
    FROM chat
    WHERE created >= date_trunc('hour', NOW())
)
SELECT timescale.created AS created,
    COUNT(DISTINCT base_id) AS metric_value,
    COUNT(DISTINCT base_id) filter (
        WHERE answered IS NOT NULL
    ) AS answered,
    COUNT(DISTINCT base_id) filter (
        WHERE not_answered IS NOT NULL
    ) AS not_answered,
    COUNT(DISTINCT base_id) filter (
        WHERE hate_speech IS NOT NULL
    ) AS hate_speech,
    COUNT(DISTINCT base_id) filter (
        WHERE TERMINATED IS NOT NULL
    ) AS TERMINATED,
    COUNT(DISTINCT base_id) filter (
        WHERE to_contact IS NOT NULL
    ) AS to_contact
FROM (
        SELECT date_trunc(
                'hour',
                generate_series(
                    current_date,
                    NOW(),
                    '1 hour'::INTERVAL
                )
            ) AS created
    ) AS timescale
    LEFT JOIN chat_stats ON chat_stats.created = timescale.created
GROUP BY 1
ORDER BY 1 DESC
