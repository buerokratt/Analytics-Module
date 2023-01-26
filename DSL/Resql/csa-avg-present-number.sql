SELECT date_trunc(:metric, created) AS date_time,
       ROUND(1.0 * SUM(CASE WHEN active::bool = true THEN 1 ELSE 0 END) / COUNT(id_code), 1) AS avg
FROM customer_support_agent_activity
Where created::date BETWEEN :start::date AND :end::date
GROUP BY 1
