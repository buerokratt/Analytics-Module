WITH active_per_hour AS
  (SELECT date_trunc('hour', csa_created) AS created,
          count(distinct(id_code)) AS active_csas
   FROM denormalized_user_data
   WHERE csa_created IS NOT NULL 
     AND csa_created >= :start::date 
     AND csa_created < (:end::date + INTERVAL '1 day')
   GROUP BY 1)
SELECT date_trunc(:metric, created) AS date_time,
       ROUND(AVG(active_csas)::numeric, 1) as avg
FROM active_per_hour
GROUP BY date_time
ORDER BY date_time;