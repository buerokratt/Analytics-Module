/*
declaration:
  version: 0.1
  description: "Calculate the average number of chats per day over a dynamic period for chats that include at least one end-user message"
  method: get
  namespace: overview
  returns: json
  allowlist:
    query:
      - field: group_period
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time grouping interval (e.g., 'day', 'week', 'month')"
  response:
    fields:
      - field: ended
        type: date
        description: "Grouped end timestamp based on the specified period"
      - field: metric_value
        type: number
        description: "Average number of chats per period with at least one end-user message"
*/
WITH
    filtered_chats AS (
        SELECT
            chat_base_id,
            MAX(ended) AS max_ended
        FROM chat.denormalized_chat_messages_for_metrics
        GROUP BY chat_base_id
        HAVING
            MAX(CASE WHEN message_author_role = 'end-user' THEN 1 ELSE 0 END) > 0
            AND MAX(ended)
            >= DATE_TRUNC(
                :group_period, CURRENT_DATE - CONCAT('1 ', :group_period)::INTERVAL
            )
    ),

    daily_chat_counts AS (
        SELECT
            DATE_TRUNC('day', max_ended) AS ended_day,
            COUNT(DISTINCT chat_base_id) AS num_chats
        FROM filtered_chats
        GROUP BY DATE_TRUNC('day', max_ended)
    )

SELECT
    DATE_TRUNC(:group_period, timescale.ended) AS ended,
    ROUND(AVG(COALESCE(num_chats, 0))) AS metric_value
FROM (
    SELECT
        DATE_TRUNC('day', GENERATE_SERIES(
            DATE_TRUNC(
                :group_period, CURRENT_DATE - CONCAT('1 ', :group_period)::INTERVAL
            ),
            NOW(),
            '1 day'::INTERVAL
        )) AS ended
) AS timescale
    LEFT JOIN daily_chat_counts ON timescale.ended = daily_chat_counts.ended_day
GROUP BY 1
ORDER BY 1 DESC;
