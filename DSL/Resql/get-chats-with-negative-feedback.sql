SELECT id, feedback_rating, created
FROM chat
WHERE feedback_rating IS NOT NULL
AND status = 'ENDED'
AND feedback_rating::int <= 5
AND created::date BETWEEN :start::date AND :end::date;