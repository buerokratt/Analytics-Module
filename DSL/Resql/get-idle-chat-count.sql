SELECT COUNT(DISTINCT base_id)
FROM chat
WHERE created BETWEEN :start::timestamptz AND :end::timestamptz
AND status = 'IDLE'