/*
declaration:
  version: 0.1
  description: "Calculate the average waiting time in seconds before customer support takes over after a bot exits, grouped by a dynamic time period"
  method: get
  namespace: overview
  returns: json
  allowlist:
    query:
      - field: group_period
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time grouping interval used in date_trunc"
      - field: botname
        type: string
        description: "Name of the bot to exclude from customer support assignment evaluation"
  response:
    fields:
      - field: ended
        type: date
        description: "Truncated timestamp for the time period grouping"
      - field: metric_value
        type: number
        description: "Average waiting time in seconds for customer support assignment"
*/
WITH
    customer_support_changes AS (
        SELECT
            chat.base_id,
            chat.customer_support_id,
            chat.updated,
            DATE_TRUNC('day', created) AS created,
            LAG(chat.customer_support_id) OVER (
                PARTITION BY chat.base_id
                ORDER BY chat.updated
            ) AS prev_support_id,
            LAG(chat.updated) OVER (
                PARTITION BY chat.base_id
                ORDER BY chat.updated
            ) AS prev_updated
        FROM chat.chat
        WHERE chat.created >= DATE_TRUNC(
            :group_period,
            CURRENT_DATE - CONCAT('1 ', :group_period)::INTERVAL
        )
    )

SELECT
    DATE_TRUNC(:group_period, timescale.ended) AS ended,
    COALESCE(
        AVG(
            EXTRACT(
                EPOCH
                FROM (updated - prev_updated)
            )
        ) FILTER (
            WHERE prev_support_id = ''
            AND customer_support_id <> '' AND customer_support_id <> 'chatbot'
        ),
        0
    ) AS metric_value
FROM (
    SELECT DATE_TRUNC(
        'day',
        GENERATE_SERIES(
            DATE_TRUNC(
                :group_period,
                CURRENT_DATE - CONCAT('1 ', :group_period)::INTERVAL
            ),
            NOW(),
            '1 day'::INTERVAL
        )
    ) AS ended
) AS timescale
    LEFT JOIN
        customer_support_changes
        ON timescale.ended = customer_support_changes.created
GROUP BY 1
ORDER BY 1 DESC
