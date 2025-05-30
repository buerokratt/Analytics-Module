/*
declaration:
  version: 0.1
  description: "Calculate the median waiting time (in minutes) for end-users before receiving a response from a backoffice-user, grouped by time period"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering messages"
      - field: end
        type: date
        description: "End date for filtering messages"
      - field: period
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time granularity for grouping median waiting times"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Start of the grouped time period"
      - field: median_waiting_time
        type: number
        description: "Median waiting time in minutes before a response from a backoffice-user"
*/
WITH
    waiting_times AS (
        SELECT
            DATE_TRUNC(:period, m_1.created) AS time,
            m_1.chat_base_id,
            (m_2.created - m_1.created) AS waiting_time
        FROM chat.message AS m_1
            INNER JOIN chat.message AS m_2
                ON m_1.chat_base_id = m_2.chat_base_id
        WHERE
            m_1.author_role = 'end-user'
            AND m_2.author_role = 'backoffice-user'
            AND m_2.created > m_1.created
            AND m_1.created >= :start::DATE
            AND m_1.created < (:end::DATE + INTERVAL '1 day')
    )

SELECT
    time,
    ROUND(
        EXTRACT(EPOCH FROM (PERCENTILE_CONT(0.5) WITHIN GROUP (
            ORDER BY waiting_time
        )))::NUMERIC / 60, 2
    ) AS median_waiting_time
FROM waiting_times
GROUP BY time
ORDER BY time
