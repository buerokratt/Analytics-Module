WITH chat_csas AS (
    SELECT DISTINCT ON (chat_base_id) 
        chat_base_id AS base_id,
        created,
        customer_support_id,
        customer_support_display_name,
        customer_support_first_name,
        customer_support_last_name,
        feedback_rating
    FROM denormalized_chat_messages_for_metrics
    WHERE customer_support_id NOT IN ('', 'chatbot')
      AND EXISTS (
        SELECT 1
        FROM denormalized_chat_messages_for_metrics dcm_inner
        WHERE dcm_inner.chat_base_id = denormalized_chat_messages_for_metrics.chat_base_id
          AND dcm_inner.message_author_role = 'end-user'
      )
      AND created::date BETWEEN :start::date AND :end::date
      AND customer_support_id NOT IN (:excluded_csas)
      AND chat_status = 'ENDED'
      AND feedback_rating IS NOT NULL
    ORDER BY chat_base_id, timestamp DESC
), period_nps_by_csa AS (
    SELECT customer_support_id,
        COALESCE(CAST(((
        SUM(CASE WHEN feedback_rating BETWEEN 9 AND 10 THEN 1 ELSE 0 END) * 1.0 -
        SUM(CASE WHEN feedback_rating BETWEEN 0 AND 6 THEN 1 ELSE 0 END)
        ) / COUNT(base_id) * 100) AS int), 0) AS period_nps
    FROM chat_csas
        GROUP BY customer_support_id, customer_support_display_name
)

SELECT 
    date_time,
    customer_support_id,
    customer_support_display_name,
    customer_support_full_name,
    nps,
    period_nps
FROM (
    SELECT 
        date_trunc(:metric, created)::text AS date_time,
        c.customer_support_id,
        customer_support_display_name,
        FIRST_VALUE(CONCAT(customer_support_first_name, ' ', customer_support_last_name)) OVER (
            PARTITION BY c.customer_support_id
        ) AS customer_support_full_name,
        coalesce(CAST(((
            SUM(CASE WHEN feedback_rating BETWEEN 9 AND 10 THEN 1 ELSE 0 END) * 1.0 -
            SUM(CASE WHEN feedback_rating BETWEEN 0 AND 6 THEN 1 ELSE 0 END)
        ) / COUNT(base_id) * 100) AS int), 0) AS nps,
        t.period_nps
    FROM chat_csas c
    JOIN period_nps_by_csa t ON t.customer_support_id = c.customer_support_id
    GROUP BY date_time, c.customer_support_id, customer_support_display_name, customer_support_first_name, customer_support_last_name, t.period_nps
) AS combined_data
ORDER BY date_time, customer_support_id;