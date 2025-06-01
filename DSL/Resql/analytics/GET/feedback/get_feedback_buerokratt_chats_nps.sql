/*
declaration:
  version: 0.1
  description: "Calculate point-in-time and overall NPS for chats involving the virtual assistant 'buerokratt', based on feedback ratings"
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
        description: "JSON object with pointNps (list of {dateTime, nps}) and periodNps (overall NPS value)"
*/
WITH
    chat_buerokratt AS (
        SELECT DISTINCT ON (chat_base_id, feedback_rating)
            chat_base_id AS base_id,
            ended,
            feedback_rating
        FROM chat.denormalized_chat_messages_for_metrics AS dcm
        WHERE
            EXISTS (
                SELECT 1
                FROM chat.denormalized_chat_messages_for_metrics AS dcm_inner
                WHERE
                    dcm_inner.chat_base_id = dcm.chat_base_id
                    AND dcm_inner.message_author_role = 'buerokratt'
            )
            AND chat_status = 'ENDED'
            AND feedback_rating IS NOT NULL
            AND ended >= :start::DATE
            AND ended < (:end::DATE + INTERVAL '1 day')
        ORDER BY chat_base_id ASC, feedback_rating ASC, timestamp DESC
    ),

    point_nps AS (
        SELECT
            DATE_TRUNC(:metric, ended)::TEXT AS date_time,
            COALESCE(
                CAST((
                    (
                        SUM(
                            CASE WHEN feedback_rating BETWEEN 9 AND 10 THEN 1 ELSE 0 END
                        )
                        * 1.0
                        - SUM(CASE WHEN feedback_rating BETWEEN 0 AND 6 THEN 1 ELSE 0 END)
                    ) / NULLIF(COUNT(feedback_rating), 0) * 100
                ) AS INT), 0
            ) AS nps
        FROM chat_buerokratt
        GROUP BY date_time
        ORDER BY date_time
    ),

    period_nps AS (
        SELECT
            COALESCE(
                CAST((
                    (
                        SUM(
                            CASE WHEN feedback_rating BETWEEN 9 AND 10 THEN 1 ELSE 0 END
                        )
                        * 1.0
                        - SUM(CASE WHEN feedback_rating BETWEEN 0 AND 6 THEN 1 ELSE 0 END)
                    ) / NULLIF(COUNT(feedback_rating), 0) * 100
                ) AS INT), 0
            ) AS nps
        FROM chat_buerokratt
    )

SELECT JSON_BUILD_OBJECT(
    'pointNps',
    (
        SELECT JSON_AGG(JSON_BUILD_OBJECT('dateTime', date_time, 'nps', nps))
        FROM point_nps
    ),
    'periodNps', (SELECT nps FROM period_nps)
) AS result
