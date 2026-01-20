WITH rating_config AS (
    SELECT value AS is_five_rating_scale
    FROM configuration
    WHERE key = 'isFiveRatingScale'
      AND id IN (SELECT max(id) FROM configuration WHERE key = 'isFiveRatingScale' GROUP BY key)
      AND NOT deleted
),
chats_filtered AS (
    SELECT DISTINCT 
        base_id,
        first_value(created) OVER (
            PARTITION BY base_id
            ORDER BY updated
        ) AS created,
        CASE 
            WHEN (SELECT COALESCE(is_five_rating_scale, 'false') = 'true' FROM rating_config) 
            THEN last_value(feedback_rating_five) OVER (
                PARTITION BY base_id
                ORDER BY updated
            )
            ELSE last_value(feedback_rating) OVER (
                PARTITION BY base_id
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
        AND STATUS = 'ENDED'
        AND CASE 
            WHEN (SELECT COALESCE(is_five_rating_scale, 'false') = 'true' FROM rating_config) 
            THEN feedback_rating_five IS NOT NULL
            ELSE feedback_rating IS NOT NULL
        END
        AND created::timestamptz BETWEEN :start::timestamptz AND :end::timestamptz
        AND (
            (:chat_type = 'buerokratt' AND EXISTS (
                SELECT 1 
                FROM message 
                WHERE message.chat_base_id = chat.base_id 
                AND message.author_role = 'buerokratt'
            ))
            OR 
            (:chat_type = 'csa' AND customer_support_id <> ''
                AND EXISTS (
                    SELECT 1 
                    FROM message 
                    WHERE message.chat_base_id = chat.base_id 
                    AND message.author_role = 'backoffice-user'
                )
                AND EXISTS (
                    SELECT 1 
                    FROM message 
                    WHERE message.chat_base_id = chat.base_id 
                    AND message.author_role = 'end-user'
                )
            )
        )
)
SELECT 
    COUNT(CASE WHEN feedback_rating_dynamic BETWEEN 9 AND 10 THEN 1 END) AS promoters,
    COUNT(CASE WHEN feedback_rating_dynamic BETWEEN 7 AND 8 THEN 1 END) AS passives,
    COUNT(CASE WHEN feedback_rating_dynamic BETWEEN 0 AND 6 THEN 1 END) AS detractors
FROM chats_filtered;
