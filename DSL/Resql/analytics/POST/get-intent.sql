SELECT COUNT(*) AS count
FROM message
WHERE intent = :intent::varchar(50)
AND created >= :start::date AND created < (:end::date + INTERVAL '1 day')
GROUP BY intent
