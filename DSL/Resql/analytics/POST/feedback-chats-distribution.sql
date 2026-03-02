WITH rating_config AS (
    SELECT value AS is_five_rating_scale
    FROM configuration
    WHERE key = 'isFiveRatingScale'
      AND "domain" IS NULL
      AND id IN (SELECT max(id) FROM configuration WHERE key = 'isFiveRatingScale' AND "domain" IS NULL)
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
),
all_ended_chats AS (
    SELECT COUNT(DISTINCT base_id) AS total_chats
    FROM chat
    WHERE (
        array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
            OR chat.end_user_url LIKE ANY(ARRAY[:urls]::TEXT[])
    )
      AND (:showTest = TRUE OR chat.test = FALSE)
      AND STATUS = 'ENDED'
      AND created::timestamptz BETWEEN :start::timestamptz AND :end::timestamptz
      AND (
            (:chat_type = 'buerokratt' AND EXISTS (
                SELECT 1 FROM message WHERE message.chat_base_id = chat.base_id AND message.author_role = 'buerokratt'
            ))
            OR
            (:chat_type = 'csa' AND customer_support_id <> ''
                AND EXISTS (
                    SELECT 1 FROM message WHERE message.chat_base_id = chat.base_id AND message.author_role = 'backoffice-user'
                )
                AND EXISTS (
                    SELECT 1 FROM message WHERE message.chat_base_id = chat.base_id AND message.author_role = 'end-user'
                )
            )
      )
),
rating_counts AS (
    SELECT feedback_rating_dynamic AS rating, COUNT(*) AS cnt
    FROM chats_filtered
    GROUP BY feedback_rating_dynamic
),
scale_ratings AS (
    SELECT generate_series AS rating
    FROM (
        SELECT generate_series(
            CASE WHEN (SELECT COALESCE(is_five_rating_scale, 'false') = 'true' FROM rating_config) THEN 1 ELSE 0 END,
            CASE WHEN (SELECT COALESCE(is_five_rating_scale, 'false') = 'true' FROM rating_config) THEN 5 ELSE 10 END
        )
    ) s
),
distribution_rows AS (
    SELECT json_agg(json_build_object('rating', sr.rating, 'count', COALESCE(rc.cnt, 0)) ORDER BY sr.rating) AS distribution
    FROM scale_ratings sr
    LEFT JOIN rating_counts rc ON sr.rating = rc.rating
)
SELECT json_build_object(
    'distribution', (SELECT distribution FROM distribution_rows),
    'total_feedback', (SELECT COUNT(*) FROM chats_filtered),
    'total_chats', (SELECT total_chats FROM all_ended_chats),
    'is_five_scale', (SELECT COALESCE(is_five_rating_scale, 'false') = 'true' FROM rating_config)
) AS result;
