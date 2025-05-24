WITH chat_csas AS (
    SELECT DISTINCT ON (chat_base_id, feedback_rating) 
        chat_base_id AS base_id,
        created,
        feedback_rating
    FROM denormalized_chat_messages_for_metrics
    WHERE customer_support_id NOT IN ('', 'chatbot')
        AND EXISTS (
            SELECT 1
            FROM denormalized_chat_messages_for_metrics dcm_inner
            WHERE dcm_inner.chat_base_id = denormalized_chat_messages_for_metrics.chat_base_id
              AND dcm_inner.message_author_role = 'end-user'
        )
        AND chat_status = 'ENDED'
        AND feedback_rating IS NOT NULL
        AND created::date BETWEEN :start::date AND :end::date
    ORDER BY chat_base_id, feedback_rating, timestamp DESC
),
point_nps AS (
    SELECT date_trunc(:metric, created)::text AS date_time,
        coalesce(CAST(((
           SUM(CASE WHEN feedback_rating BETWEEN 9 AND 10 THEN 1 ELSE 0 END) * 1.0 -
           SUM(CASE WHEN feedback_rating BETWEEN 0 AND 6 THEN 1 ELSE 0 END)
           ) / COUNT(base_id) * 100) AS int), 0) AS nps
    FROM chat_csas
    GROUP BY date_time
),
period_nps AS (
    SELECT coalesce(CAST(((
           SUM(CASE WHEN feedback_rating BETWEEN 9 AND 10 THEN 1 ELSE 0 END) * 1.0 -
           SUM(CASE WHEN feedback_rating BETWEEN 0 AND 6 THEN 1 ELSE 0 END)
           ) / COUNT(base_id) * 100) AS int), 0) AS nps
    FROM chat_csas
)
SELECT json_build_object(
    'pointNps', (SELECT json_agg(json_build_object('dateTime', date_time, 'nps', nps)) FROM point_nps),
    'periodNps', (SELECT nps FROM period_nps)
) AS result