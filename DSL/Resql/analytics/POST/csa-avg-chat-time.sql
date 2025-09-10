WITH chats AS (
    SELECT DISTINCT
        c.base_id,
        date_trunc(:metric, c.created) AS date_time,
        m.author_id
    FROM chat c
             JOIN message m ON m.chat_base_id = c.base_id
    WHERE (
        array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
            OR c.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
        )
      AND (
        :showTest = TRUE
            OR c.test = FALSE
        )
      AND c.created::date BETWEEN :start::date AND :end::date
                                     AND m.author_role IN ('backoffice-user', 'end-user')
                                     AND m.author_id IS NOT NULL
                                     AND m.author_id <> ''
                                     AND m.author_id <> 'null'
    ),
    chat_lengths AS (
SELECT
    c.base_id,
    age(MAX(m.created), MIN(m.created)) AS chat_length
FROM chat c
    JOIN message m ON m.chat_base_id = c.base_id
WHERE c.base_id IN (SELECT base_id FROM chats)
GROUP BY c.base_id
    )
SELECT
    date_time,
    max(u.display_name) AS customer_support_display_name,
    max(CONCAT(u.first_name, ' ', u.last_name)) AS customer_support_full_name,
    max(u.id_code) AS customer_support_id,
    ROUND(EXTRACT(epoch FROM COALESCE(AVG(chat_length), '0 seconds'::interval)) / 60) AS "count"
FROM chats
         LEFT JOIN chat_lengths cl ON chats.base_id = cl.base_id
         LEFT JOIN "user" u ON u.id_code = chats.author_id
WHERE u.id_code NOT IN (:excluded_csas)
GROUP BY date_time, author_id;