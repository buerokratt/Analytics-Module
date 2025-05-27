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
WITH customer_support_changes AS (
    SELECT base_id,
        date_trunc('day', created) AS created,
        customer_support_id,
        updated,
        lag(customer_support_id) over (
            PARTITION by base_id
            ORDER BY updated
        ) AS prev_support_id,
        lag(updated) over (
            PARTITION by base_id
            ORDER BY updated
        ) AS prev_updated
    FROM chat
    WHERE chat.created >= date_trunc(
            :group_period,
            current_date - concat('1 ', :group_period)::INTERVAL
        )
)
SELECT date_trunc(:group_period, timescale.ended) AS ended,
    COALESCE(
        AVG(
            extract(
                epoch
                FROM (updated - prev_updated)
            )
        ) filter (
            WHERE prev_support_id = ''
                AND customer_support_id <> '' AND customer_support_id <> :botname
        ),
        0
    ) AS metric_value
FROM (
        SELECT date_trunc(
                'day',
                generate_series(
                    date_trunc(
                        :group_period,
                        current_date - concat('1 ', :group_period)::INTERVAL
                    ),
                    NOW(),
                    '1 day'::INTERVAL
                )
            ) AS ended
    ) AS timescale
    LEFT JOIN customer_support_changes ON customer_support_changes.created = timescale.ended
GROUP BY 1
ORDER BY 1 desc
