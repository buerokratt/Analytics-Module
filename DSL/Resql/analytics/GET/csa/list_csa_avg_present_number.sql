/*
declaration:
  version: 0.1
  description: "Calculate average number of active CSAs per time period based on hourly activity data"
  method: get
  namespace: csa
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering CSA activity records"
      - field: end
        type: date
        description: "End date for filtering CSA activity records"
      - field: metric
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time granularity for aggregating active CSA counts"
  response:
    fields:
      - field: date_time
        type: timestamp
        description: "Start of the aggregated time bucket"
      - field: avg
        type: number
        description: "Average number of active CSAs during the period"
*/
WITH
    active_per_hour AS (
        SELECT
            DATE_TRUNC('hour', csa_created) AS created,
            COUNT(DISTINCT id_code) AS active_csas
        FROM auth_users.denormalized_user_data
        WHERE
            csa_created IS NOT NULL
            AND csa_created >= :start::DATE 
            AND csa_created < (:end::DATE + INTERVAL '1 day')
        GROUP BY 1
    )

SELECT
    DATE_TRUNC(:metric, created) AS date_time,
    ROUND(AVG(active_csas)::NUMERIC, 1) AS avg
FROM active_per_hour
GROUP BY date_time
ORDER BY date_time;
