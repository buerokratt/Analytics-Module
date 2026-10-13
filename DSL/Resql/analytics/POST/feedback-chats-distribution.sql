WITH rating_config AS (
    SELECT value AS is_five_rating_scale
    FROM configuration
    WHERE key = 'isFiveRatingScale'
      AND "domain" IS NULL
      AND id IN (SELECT max(id) FROM configuration WHERE key = 'isFiveRatingScale' AND "domain" IS NULL)
      AND NOT deleted
),
max_chats AS (
    SELECT MAX(id) AS max_id, base_id
    FROM chat
    WHERE ended IS NOT NULL
      AND status <> 'IDLE'
      AND ended::timestamptz BETWEEN :start::timestamptz AND :end::timestamptz
      AND (
        array_length(ARRAY[:urls]::TEXT[], 1) IS NULL
            OR COALESCE(
                (SELECT cd.domain FROM chat_domain cd WHERE cd.chat_base_id = chat.base_id),
                chat.end_user_url
            ) LIKE ANY(ARRAY[:urls]::TEXT[])
      )
    GROUP BY base_id
),
ended_chats AS (
    SELECT
        chat.base_id,
        CASE
            WHEN (SELECT COALESCE(is_five_rating_scale, 'false') = 'true' FROM rating_config)
            THEN chat.feedback_rating_five
            ELSE chat.feedback_rating
        END AS feedback_rating_dynamic
    FROM chat
    JOIN max_chats ON chat.id = max_chats.max_id
    WHERE (
        COALESCE(:showTest, FALSE) = TRUE
            OR COALESCE(chat.test, FALSE) = FALSE
    )
      AND EXISTS (
        SELECT 1
        FROM message
        WHERE message.chat_base_id = chat.base_id
          AND message.content <> ''
          AND message.content <> 'message-read'
      )
),
latest_open_chat AS (
    SELECT DISTINCT ON (chat.base_id)
        chat.base_id,
        chat.customer_support_id AS latest_open_csa
    FROM chat
    JOIN ended_chats ON ended_chats.base_id = chat.base_id
    WHERE chat.status = 'OPEN'
    ORDER BY chat.base_id, chat.id DESC
),
chat_csa_ids AS (
    SELECT
        chat.base_id,
        ARRAY_AGG(DISTINCT chat.customer_support_id) FILTER (
            WHERE NOT (
                chat.customer_support_id = 'chatbot'
                AND (lo.latest_open_csa IS NULL OR lo.latest_open_csa <> 'chatbot')
            )
        ) AS all_csa_ids
    FROM chat
    JOIN ended_chats ON ended_chats.base_id = chat.base_id
    LEFT JOIN latest_open_chat lo ON lo.base_id = chat.base_id
    GROUP BY chat.base_id
),
chats_filtered AS (
    SELECT ended_chats.base_id, ended_chats.feedback_rating_dynamic
    FROM ended_chats
    JOIN chat_csa_ids ON chat_csa_ids.base_id = ended_chats.base_id
    WHERE (
        :chat_type = 'buerokratt'
            AND 'chatbot' = ANY(COALESCE(chat_csa_ids.all_csa_ids, ARRAY[]::TEXT[]))
    )
       OR (
        :chat_type = 'csa'
            AND EXISTS (
                SELECT 1
                FROM unnest(COALESCE(chat_csa_ids.all_csa_ids, ARRAY[]::TEXT[])) AS csa_id
                WHERE csa_id <> ''
                  AND csa_id <> 'chatbot'
            )
    )
),
all_ended_chats AS (
    SELECT COUNT(*) AS total_chats
    FROM chats_filtered
),
rating_counts AS (
    SELECT feedback_rating_dynamic AS rating, COUNT(*) AS cnt
    FROM chats_filtered
    WHERE feedback_rating_dynamic IS NOT NULL
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
valid_feedback_count AS (
    SELECT COALESCE(SUM(rc.cnt), 0) AS cnt
    FROM scale_ratings sr
    JOIN rating_counts rc ON sr.rating = rc.rating
),
no_feedback_count AS (
    SELECT (SELECT total_chats FROM all_ended_chats) - (SELECT cnt FROM valid_feedback_count) AS cnt
),
distribution_with_no_feedback AS (
    SELECT json_agg(elem ORDER BY ord, rating_nullable NULLS LAST) AS distribution
    FROM (
        SELECT 0 AS ord, sr.rating AS rating_nullable, json_build_object('rating', sr.rating, 'count', COALESCE(rc.cnt, 0)) AS elem
        FROM scale_ratings sr
        LEFT JOIN rating_counts rc ON sr.rating = rc.rating
        UNION ALL
        SELECT 1 AS ord, NULL::int AS rating_nullable, json_build_object('rating', '-', 'count', (SELECT cnt FROM no_feedback_count)) AS elem
    ) parts
)
SELECT json_build_object(
    'distribution', (SELECT distribution FROM distribution_with_no_feedback),
    'total_feedback', (SELECT cnt FROM valid_feedback_count),
    'total_chats', (SELECT total_chats FROM all_ended_chats),
    'is_five_scale', (SELECT COALESCE(is_five_rating_scale, 'false') = 'true' FROM rating_config)
) AS result;
