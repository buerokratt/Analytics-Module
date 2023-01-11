SELECT COUNT(distinct base_id)
FROM chat
WHERE created BETWEEN :start :: timestamptz AND :end :: timestamptz;