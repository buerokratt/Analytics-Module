WITH chats AS (
    SELECT DISTINCT base_id, created, end_user_email, end_user_phone, end_user_url
    FROM chat
    WHERE (
        array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
            OR chat.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
        )
      AND (
        :showTest = TRUE
            OR chat.test = FALSE
        )
      AND created::date BETWEEN :start::date AND :end::date
    ),
    offlineCSAs AS (
SELECT COUNT(csa.id_code) AS csaCount
FROM customer_support_agent_activity csa
WHERE csa.id = (
    SELECT MAX(id)
    FROM customer_support_agent_activity
    WHERE id_code = csa.id_code
    )
      AND csa.status = 'offline'
      AND csa.created::date BETWEEN :start::date AND :end::date
    ),
    AllCSAs AS (
SELECT COUNT(*) AS userCount
FROM public.user pu
WHERE pu.created::date NOT BETWEEN :start::date AND :end::date
    )
SELECT
    DATE_TRUNC(:period, c.created) AS time,
  COUNT(DISTINCT c.base_id) AS chat_count
FROM chat c
    JOIN message m ON c.base_id = m.chat_base_id
WHERE m.event = 'unavailable-contact-information-fulfilled'
  AND (
    (c.end_user_email IS NOT NULL AND c.end_user_email <> '')
   OR
    (c.end_user_phone IS NOT NULL AND c.end_user_phone <> '')
    )
)
AND (
  c.base_id IN (
    SELECT DISTINCT m.chat_base_id
    FROM message m
    WHERE m.event = 'unavailable_csas_ask_contacts'
    AND m.author_role = 'buerokratt'
  )
)
GROUP BY time
ORDER BY time;
