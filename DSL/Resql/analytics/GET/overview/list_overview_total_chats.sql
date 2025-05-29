/*
declaration:
  version: 0.1
  description: "Count distinct chats with at least one end-user message, grouped by a dynamic time period"
  method: get
  namespace: overview
  returns: json
  allowlist:
    query:
      - field: group_period
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time grouping interval used in date_trunc and generate_series"
  response:
    fields:
      - field: ended
        type: date
        description: "Truncated end timestamp based on the specified grouping interval"
      - field: metric_value
        type: number
        description: "Number of distinct chats with at least one end-user message in the given period"
*/
WITH
    filtered_chats AS (
        SELECT
            chat_base_id,
            DATE_TRUNC(:group_period, ended) AS period_ended
        FROM denormalized_chat_messages_for_metrics AS dcm
        WHERE
            ended IS NOT NULL
            AND ended
            >= DATE_TRUNC(
                :group_period, CURRENT_DATE - CONCAT('1 ', :group_period)::INTERVAL
            )
            AND EXISTS (
                SELECT 1
                FROM denormalized_chat_messages_for_metrics AS inner_dcm
                WHERE inner_dcm.chat_base_id = dcm.chat_base_id
                GROUP BY inner_dcm.chat_base_id
                HAVING
                    SUM(
                        CASE
                            WHEN
                                inner_dcm.message_author_role = 'end-user'
                                THEN 1
                            ELSE 0
                        END
                    )
                    > 0
            )
        GROUP BY chat_base_id, DATE_TRUNC(:group_period, ended)
    ),

    chat_counts AS (
        SELECT
            period_ended,
            COUNT(DISTINCT chat_base_id) AS num_chats
        FROM filtered_chats
        GROUP BY period_ended
    )

SELECT
    timescale.ended,
    COALESCE(chat_counts.num_chats, 0) AS metric_value
FROM (
    SELECT
        DATE_TRUNC(:group_period, GENERATE_SERIES(
            CURRENT_DATE - CONCAT('1 ', :group_period)::INTERVAL,
            NOW(),
            CONCAT('1 ', :group_period)::INTERVAL
        )) AS ended
) AS timescale
    LEFT JOIN chat_counts ON timescale.ended = chat_counts.period_ended
ORDER BY 1 DESC;
