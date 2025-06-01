/*
declaration:
  version: 0.1
  description: "Calculate per-period and overall NPS for each CSA, excluding specified agents"
  method: get
  namespace: feedback
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering feedback ratings"
      - field: end
        type: date
        description: "End date for filtering feedback ratings"
      - field: metric
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time granularity for NPS grouping"
      - field: excluded_csas
        type: string
        description: "Comma-separated list of CSA IDs to exclude"
  response:
    fields:
      - field: date_time
        type: string
        description: "Start of the time period for which NPS is calculated"
      - field: customer_support_id
        type: string
        description: "ID of the customer support agent"
      - field: customer_support_display_name
        type: string
        description: "Display name of the CSA"
      - field: customer_support_full_name
        type: string
        description: "Full name of the CSA (first + last)"
      - field: nps
        type: integer
        description: "Net Promoter Score for the CSA in the given time period"
      - field: period_nps
        type: integer
        description: "Overall Net Promoter Score for the CSA during the full period"
*/
WITH
    chat_csas AS (
        SELECT DISTINCT ON (chat_base_id)
            chat_base_id AS base_id,
            created,
            customer_support_id,
            customer_support_display_name,
            customer_support_first_name,
            customer_support_last_name,
            feedback_rating
        FROM chat.denormalized_chat_messages_for_metrics AS dcm
        WHERE
            customer_support_id NOT IN ('', 'chatbot')
            AND EXISTS (
                SELECT 1
                FROM chat.denormalized_chat_messages_for_metrics AS dcm_inner
                WHERE
                    dcm_inner.chat_base_id = dcm.chat_base_id
                    AND dcm_inner.message_author_role = 'end-user'
            )
            AND created >= :start::DATE
            AND created < (:end::DATE + INTERVAL '1 day')
            AND customer_support_id <> ALL(STRING_TO_ARRAY(:excluded_csas, ','))
            AND chat_status = 'ENDED'
            AND feedback_rating IS NOT NULL
        ORDER BY chat_base_id ASC, timestamp DESC
    ),

period_nps_by_csa AS (
        SELECT
            customer_support_id,
            COALESCE(CAST(((
                SUM(CASE WHEN feedback_rating BETWEEN 9 AND 10 THEN 1 ELSE 0 END) * 1.0
                - SUM(CASE WHEN feedback_rating BETWEEN 0 AND 6 THEN 1 ELSE 0 END)
            ) / COUNT(base_id) * 100) AS INT), 0) AS period_nps
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
        DATE_TRUNC(:metric, created)::TEXT AS date_time,
        c.customer_support_id,
        customer_support_display_name,
        t.period_nps,
        FIRST_VALUE(
            CONCAT(customer_support_first_name, ' ', customer_support_last_name)
        ) OVER (
            PARTITION BY c.customer_support_id
        ) AS customer_support_full_name,
        COALESCE(CAST(((
            SUM(CASE WHEN feedback_rating BETWEEN 9 AND 10 THEN 1 ELSE 0 END) * 1.0
            - SUM(CASE WHEN feedback_rating BETWEEN 0 AND 6 THEN 1 ELSE 0 END)
        ) / COUNT(base_id) * 100) AS INT), 0) AS nps
    FROM chat_csas AS c
        INNER JOIN
            period_nps_by_csa AS t
            ON c.customer_support_id = t.customer_support_id
    GROUP BY
        date_time,
        c.customer_support_id,
        customer_support_display_name,
        customer_support_first_name,
        customer_support_last_name,
        t.period_nps
) AS combined_data
ORDER BY date_time, customer_support_id;
