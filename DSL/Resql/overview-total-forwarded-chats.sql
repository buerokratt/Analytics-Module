WITH botname AS (
    SELECT "value"
    FROM "configuration"
    WHERE "key" = 'bot_institution_id'
    LIMIT 1
)
SELECT COUNT(DISTINCT base_id) filter (
        WHERE forwarded_to IS NOT NULL
            AND received_from <> (
                SELECT "value"
                FROM botname
            )
            AND external_id IS NULL
    ) AS "forwarded_internally",
    COUNT(DISTINCT base_id) filter (
        WHERE external_id IS NOT NULL
    ) AS "forwarded_externally"
FROM chat
WHERE date_trunc('day', chat.created) = date_trunc('day', current_date - '1 day'::INTERVAL)
