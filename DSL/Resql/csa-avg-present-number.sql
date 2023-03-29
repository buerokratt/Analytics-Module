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
