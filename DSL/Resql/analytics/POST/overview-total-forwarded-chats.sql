WITH latest_chat AS (
    SELECT DISTINCT ON (base_id)
    base_id,
    status,
    external_id,
    ended,
    end_user_url,
    test
FROM chat
WHERE (:showTest = TRUE OR chat.test = FALSE)
  AND (
    array_length(ARRAY[:urls]::text[], 1) IS NULL
    OR (array_length(ARRAY[:urls]::text[], 1) = 1 AND (ARRAY[:urls]::text[])[1] = 'none')
    OR chat.end_user_url LIKE ANY(ARRAY[:urls]::text[]))
ORDER BY base_id, ended DESC
    ),
    redirected_chats AS (
SELECT DISTINCT base_id
FROM chat
WHERE status = 'REDIRECTED'
)
SELECT COUNT(DISTINCT base_id) AS metric_value
FROM forwarded_chats_by_csa
WHERE date_trunc('day', forwarded_chats_by_csa.ended) = date_trunc('day', current_date - '1 day'::INTERVAL)
UNION ALL
SELECT COUNT(DISTINCT base_id) FILTER (
        WHERE external_id IS NOT NULL AND external_id <> ''
    ) AS metric_value
FROM chat
WHERE (
    :showTest = TRUE
        OR chat.test = FALSE
    )
  AND (
    array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
        OR chat.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
    )
  AND date_trunc('day', chat.ended) = date_trunc('day', current_date - '1 day'::INTERVAL);