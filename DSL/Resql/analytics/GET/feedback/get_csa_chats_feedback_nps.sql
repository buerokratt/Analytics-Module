/*
declaration:
  version: 0.1
  description: "Calculate point-in-time and overall NPS (Net Promoter Score) based on feedback ratings from end-user chats with CSAs"
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
        description: "Time granularity for grouping point NPS scores"
  response:
    fields:
      - field: result
        type: object
        properties:
          pointNps:
            type: array
            items:
              type: object
              properties:
                dateTime:
                  type: timestamp
                nps:
                  type: number
          periodNps:
            type: array
            items:
              type: number
        description: "Contains both pointNps (list of {dateTime, nps}) and periodNps (overall NPS value)"
*/
WITH
    chat_csas AS (
        SELECT DISTINCT ON (chat_base_id, feedback_rating)
            chat_base_id AS base_id,
            created,
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
            AND chat_status = 'ENDED'
            AND feedback_rating IS NOT NULL
            AND created >= :start::DATE
            AND created < (:end::DATE + INTERVAL '1 day')
        ORDER BY chat_base_id ASC, feedback_rating ASC, timestamp DESC
    ),

    point_nps AS (
        SELECT
            DATE_TRUNC(:metric, created)::TEXT AS date_time,
            COALESCE(CAST(((
                SUM(CASE WHEN feedback_rating BETWEEN 9 AND 10 THEN 1 ELSE 0 END) * 1.0
                - SUM(CASE WHEN feedback_rating BETWEEN 0 AND 6 THEN 1 ELSE 0 END)
            ) / COUNT(base_id) * 100) AS INT), 0) AS nps
        FROM chat_csas
        GROUP BY date_time
    ),

    period_nps AS (
        SELECT
            COALESCE(CAST(((
                SUM(CASE WHEN feedback_rating BETWEEN 9 AND 10 THEN 1 ELSE 0 END) * 1.0
                - SUM(CASE WHEN feedback_rating BETWEEN 0 AND 6 THEN 1 ELSE 0 END)
            ) / COUNT(base_id) * 100) AS INT), 0) AS nps
        FROM chat_csas
    )

SELECT JSON_BUILD_OBJECT(
    'pointNps',
    (
        SELECT JSON_AGG(JSON_BUILD_OBJECT('dateTime', date_time, 'nps', nps))
        FROM point_nps
    ),
    'periodNps', (SELECT nps FROM period_nps)
) AS result
