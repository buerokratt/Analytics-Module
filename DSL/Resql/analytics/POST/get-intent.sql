SELECT COUNT(*) AS count
FROM message
WHERE intent = :intent::varchar(50)
AND created::timestamptz BETWEEN :start::timestamptz AND :end::timestamptz
GROUP BY intent
