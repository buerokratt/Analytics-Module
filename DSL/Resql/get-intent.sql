SELECT COUNT(*) AS count
FROM message
WHERE intent = :intent::varchar(50)
AND created BETWEEN :start::date AND :end::date
GROUP BY intent
