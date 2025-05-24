WITH latest_open_chats AS (
    SELECT DISTINCT ON (chat_base_id)
        chat_base_id,
        customer_support_id AS latest_open_csa
    FROM denormalized_chat_messages_for_metrics
    WHERE chat_status = 'OPEN'
    ORDER BY chat_base_id, timestamp DESC
),
rated_chats AS (
    SELECT 
        chat_base_id AS base_id,
        created,
        ended,
        feedback_rating,
        feedback_text,
        customer_support_id,
        customer_support_first_name AS first_name,
        customer_support_last_name AS last_name,
        (SELECT ARRAY_AGG(DISTINCT TRIM(
            CASE
                WHEN dcm_inner.customer_support_id = 'chatbot' THEN dcm_inner.customer_support_display_name
                ELSE COALESCE(
                    NULLIF(TRIM(dcm_inner.customer_support_first_name || ' ' || dcm_inner.customer_support_last_name), ''), 
                    dcm_inner.customer_support_display_name
                )
            END
        )) 
        FILTER (
            WHERE NOT (
                dcm_inner.customer_support_id = 'chatbot'
                AND (
                    (SELECT latest_open_csa FROM latest_open_chats WHERE chat_base_id = dcm_inner.chat_base_id) IS NULL 
                    OR 
                    (SELECT latest_open_csa FROM latest_open_chats WHERE chat_base_id = dcm_inner.chat_base_id) <> 'chatbot'
                )
            )
        )
        FROM denormalized_chat_messages_for_metrics dcm_inner
        WHERE dcm_inner.chat_base_id = denormalized_chat_messages_for_metrics.chat_base_id
          AND dcm_inner.customer_support_id IS NOT NULL 
          AND dcm_inner.customer_support_id != ''
        ) AS all_csa_names,
        CEIL(COUNT(*) OVER() / :page_size::DECIMAL) AS total_pages
    FROM denormalized_chat_messages_for_metrics
    WHERE chat_status = 'ENDED'
      AND created::date BETWEEN :start::date AND :end::date
      AND feedback_rating IS NOT NULL
      AND feedback_rating <= 5
)
SELECT
    base_id,
    created,
    ended,
    feedback_rating AS rating,
    feedback_text AS feedback,
    first_name,
    last_name,
    all_csa_names,
    total_pages
FROM rated_chats 
ORDER BY 
    CASE WHEN :sorting = 'created desc' THEN created END DESC,
    CASE WHEN :sorting = 'created asc' THEN created END ASC,
    CASE WHEN :sorting = 'ended desc' THEN ended END DESC,
    CASE WHEN :sorting = 'ended asc' THEN ended END ASC,
    CASE WHEN :sorting = 'base_id desc' THEN base_id END DESC,
    CASE WHEN :sorting = 'base_id asc' THEN base_id END ASC,
    CASE WHEN :sorting = 'feedback desc' THEN feedback_text END DESC,
    CASE WHEN :sorting = 'feedback asc' THEN feedback_text END ASC,
    CASE WHEN :sorting = 'rating desc' THEN feedback_rating END DESC,
    CASE WHEN :sorting = 'rating asc' THEN feedback_rating END ASC
OFFSET ((GREATEST(:page, 1) - 1) * :page_size) 
LIMIT :page_size;