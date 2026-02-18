WITH rating_config AS (
    SELECT value AS is_five_rating_scale
    FROM configuration
    WHERE key = 'isFiveRatingScale'
      AND "domain" IS NULL
      AND id IN (SELECT max(id) FROM configuration WHERE key = 'isFiveRatingScale' AND "domain" IS NULL)
      AND NOT deleted
),
chat_csas AS (
    SELECT DISTINCT base_id,
    first_value(created) over (
            PARTITION by base_id
            ORDER BY updated
            ) AS created,
    CASE 
        WHEN (SELECT COALESCE(is_five_rating_scale, 'false') = 'true' FROM rating_config) 
        THEN last_value(feedback_rating_five) over (
                PARTITION by base_id
                ORDER BY updated
                )
        ELSE last_value(feedback_rating) over (
                PARTITION by base_id
                ORDER BY updated
                )
    END AS feedback_rating_dynamic
    FROM chat
    WHERE (
        array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
            OR chat.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
        )
      AND (
        :showTest = TRUE
            OR chat.test = FALSE
        )
        AND customer_support_id NOT IN ('', 'chatbot')
        AND EXISTS (
            SELECT 1
            FROM message
            WHERE message.chat_base_id = chat.base_id
                AND message.author_role = 'end-user'
        )
        AND STATUS = 'ENDED'
        AND CASE 
            WHEN (SELECT COALESCE(is_five_rating_scale, 'false') = 'true' FROM rating_config) 
            THEN feedback_rating_five IS NOT NULL
            ELSE feedback_rating IS NOT NULL
        END
        AND created::timestamptz BETWEEN :start::timestamptz AND :end::timestamptz
),
point_nps AS (
    SELECT date_trunc(:metric, created)::text AS date_time,
        coalesce(CAST(((
           SUM(CASE WHEN feedback_rating_dynamic BETWEEN 9 AND 10 THEN 1 ELSE 0 END) * 1.0 -
           SUM(CASE WHEN feedback_rating_dynamic BETWEEN 0 AND 6 THEN 1 ELSE 0 END)
           ) / COUNT(base_id) * 100) AS int), 0) AS nps
    FROM chat_csas
    GROUP BY date_time
    ORDER BY date_time
),
period_nps AS (
    SELECT coalesce(CAST(((
           SUM(CASE WHEN feedback_rating_dynamic BETWEEN 9 AND 10 THEN 1 ELSE 0 END) * 1.0 -
           SUM(CASE WHEN feedback_rating_dynamic BETWEEN 0 AND 6 THEN 1 ELSE 0 END)
           ) / COUNT(base_id) * 100) AS int), 0) AS nps
    FROM chat_csas
)
SELECT json_build_object(
    'pointNps', (SELECT json_agg(json_build_object('dateTime', date_time, 'nps', nps)) FROM point_nps),
    'periodNps', (SELECT nps FROM period_nps)
) AS result
