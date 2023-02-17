SELECT COUNT(*) AS count
FROM message
WHERE intent = :intent::varchar(50)
AND created::date BETWEEN :start::date AND :end::date
GROUP BY intent
