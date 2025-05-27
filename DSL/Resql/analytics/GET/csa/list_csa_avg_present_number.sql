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
WITH active_per_hour AS
  (SELECT date_trunc('hour', created) AS created,
          count(distinct(id_code)) AS active_csas
   FROM customer_support_agent_activity
   WHERE created::date BETWEEN :start::date AND :end::date
   GROUP BY 1)
SELECT date_trunc(:metric, created) AS date_time,
      ROUND(AVG(active_csas)::numeric, 1) as avg
FROM active_per_hour
GROUP BY date_time
