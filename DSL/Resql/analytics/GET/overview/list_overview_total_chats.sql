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
            CASE
                WHEN
                    :group_period = 'microseconds'
                    THEN DATE_TRUNC('microseconds', ended)
                WHEN
                    :group_period = 'milliseconds'
                    THEN DATE_TRUNC('milliseconds', ended)
                WHEN :group_period = 'second' THEN DATE_TRUNC('second', ended)
                WHEN :group_period = 'minute' THEN DATE_TRUNC('minute', ended)
                WHEN :group_period = 'hour' THEN DATE_TRUNC('hour', ended)
                WHEN :group_period = 'day' THEN DATE_TRUNC('day', ended)
                WHEN :group_period = 'week' THEN DATE_TRUNC('week', ended)
                WHEN :group_period = 'month' THEN DATE_TRUNC('month', ended)
                WHEN :group_period = 'quarter' THEN DATE_TRUNC('quarter', ended)
                WHEN :group_period = 'year' THEN DATE_TRUNC('year', ended)
                WHEN :group_period = 'decade' THEN DATE_TRUNC('decade', ended)
                WHEN :group_period = 'century' THEN DATE_TRUNC('century', ended)
                WHEN :group_period = 'millennium' THEN DATE_TRUNC('millennium', ended)
                ELSE DATE_TRUNC('month', ended)
            END AS period_ended
        FROM chat.denormalized_chat_messages_for_metrics AS dcm
        WHERE
            ended IS NOT NULL
            AND ended >= CASE
                WHEN
                    :group_period = 'microseconds'
                    THEN
                        DATE_TRUNC(
                            'microseconds', CURRENT_DATE - INTERVAL '1 microsecond'
                        )
                WHEN
                    :group_period = 'milliseconds'
                    THEN
                        DATE_TRUNC(
                            'milliseconds', CURRENT_DATE - INTERVAL '1 millisecond'
                        )
                WHEN
                    :group_period = 'second'
                    THEN DATE_TRUNC('second', CURRENT_DATE - INTERVAL '1 second')
                WHEN
                    :group_period = 'minute'
                    THEN DATE_TRUNC('minute', CURRENT_DATE - INTERVAL '1 minute')
                WHEN
                    :group_period = 'hour'
                    THEN DATE_TRUNC('hour', CURRENT_DATE - INTERVAL '1 hour')
                WHEN
                    :group_period = 'day'
                    THEN DATE_TRUNC('day', CURRENT_DATE - INTERVAL '1 day')
                WHEN
                    :group_period = 'week'
                    THEN DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
                WHEN
                    :group_period = 'month'
                    THEN DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                WHEN
                    :group_period = 'quarter'
                    THEN DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
                WHEN
                    :group_period = 'year'
                    THEN DATE_TRUNC('year', CURRENT_DATE - INTERVAL '1 year')
                WHEN
                    :group_period = 'decade'
                    THEN DATE_TRUNC('decade', CURRENT_DATE - INTERVAL '10 years')
                WHEN
                    :group_period = 'century'
                    THEN DATE_TRUNC('century', CURRENT_DATE - INTERVAL '100 years')
                WHEN
                    :group_period = 'millennium'
                    THEN DATE_TRUNC('millennium', CURRENT_DATE - INTERVAL '1000 years')
                ELSE DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
            END
            AND EXISTS (
                SELECT 1
                FROM chat.denormalized_chat_messages_for_metrics AS inner_dcm
                WHERE
                    inner_dcm.chat_base_id = dcm.chat_base_id
                    AND inner_dcm.message_author_role = 'end-user'
            )
        GROUP BY chat_base_id, period_ended
    ),

    chat_counts AS (
        SELECT
            period_ended,
            COUNT(DISTINCT chat_base_id) AS num_chats
        FROM filtered_chats
        GROUP BY period_ended
    ),

    -- Generate time series outside of CASE statement
    time_series AS (
        SELECT GENERATE_SERIES(
            CASE
                WHEN
                    :group_period = 'microseconds'
                    THEN CURRENT_DATE - INTERVAL '1 microsecond'
                WHEN
                    :group_period = 'milliseconds'
                    THEN CURRENT_DATE - INTERVAL '1 millisecond'
                WHEN :group_period = 'second' THEN CURRENT_DATE - INTERVAL '1 second'
                WHEN :group_period = 'minute' THEN CURRENT_DATE - INTERVAL '1 minute'
                WHEN :group_period = 'hour' THEN CURRENT_DATE - INTERVAL '1 hour'
                WHEN :group_period = 'day' THEN CURRENT_DATE - INTERVAL '1 day'
                WHEN :group_period = 'week' THEN CURRENT_DATE - INTERVAL '1 week'
                WHEN :group_period = 'month' THEN CURRENT_DATE - INTERVAL '1 month'
                WHEN :group_period = 'quarter' THEN CURRENT_DATE - INTERVAL '3 months'
                WHEN :group_period = 'year' THEN CURRENT_DATE - INTERVAL '1 year'
                WHEN :group_period = 'decade' THEN CURRENT_DATE - INTERVAL '10 years'
                WHEN :group_period = 'century' THEN CURRENT_DATE - INTERVAL '100 years'
                WHEN
                    :group_period = 'millennium'
                    THEN CURRENT_DATE - INTERVAL '1000 years'
                ELSE CURRENT_DATE - INTERVAL '1 month'
            END,
            NOW(),
            CASE
                WHEN :group_period = 'microseconds' THEN INTERVAL '1 microsecond'
                WHEN :group_period = 'milliseconds' THEN INTERVAL '1 millisecond'
                WHEN :group_period = 'second' THEN INTERVAL '1 second'
                WHEN :group_period = 'minute' THEN INTERVAL '1 minute'
                WHEN :group_period = 'hour' THEN INTERVAL '1 hour'
                WHEN :group_period = 'day' THEN INTERVAL '1 day'
                WHEN :group_period = 'week' THEN INTERVAL '1 week'
                WHEN :group_period = 'month' THEN INTERVAL '1 month'
                WHEN :group_period = 'quarter' THEN INTERVAL '3 months'
                WHEN :group_period = 'year' THEN INTERVAL '1 year'
                WHEN :group_period = 'decade' THEN INTERVAL '10 years'
                WHEN :group_period = 'century' THEN INTERVAL '100 years'
                WHEN :group_period = 'millennium' THEN INTERVAL '1000 years'
                ELSE INTERVAL '1 month'
            END
        ) AS ts
    ),

    timescale AS (
        SELECT
            CASE
                WHEN :group_period = 'microseconds' THEN DATE_TRUNC('microseconds', ts)
                WHEN :group_period = 'milliseconds' THEN DATE_TRUNC('milliseconds', ts)
                WHEN :group_period = 'second' THEN DATE_TRUNC('second', ts)
                WHEN :group_period = 'minute' THEN DATE_TRUNC('minute', ts)
                WHEN :group_period = 'hour' THEN DATE_TRUNC('hour', ts)
                WHEN :group_period = 'day' THEN DATE_TRUNC('day', ts)
                WHEN :group_period = 'week' THEN DATE_TRUNC('week', ts)
                WHEN :group_period = 'month' THEN DATE_TRUNC('month', ts)
                WHEN :group_period = 'quarter' THEN DATE_TRUNC('quarter', ts)
                WHEN :group_period = 'year' THEN DATE_TRUNC('year', ts)
                WHEN :group_period = 'decade' THEN DATE_TRUNC('decade', ts)
                WHEN :group_period = 'century' THEN DATE_TRUNC('century', ts)
                WHEN :group_period = 'millennium' THEN DATE_TRUNC('millennium', ts)
                ELSE DATE_TRUNC('month', ts)
            END AS ended
        FROM time_series
    )

SELECT
    timescale.ended,
    COALESCE(chat_counts.num_chats, 0) AS metric_value
FROM timescale
    LEFT JOIN chat_counts ON timescale.ended = chat_counts.period_ended
ORDER BY 1 DESC;
