SELECT base_id AS id,
    MIN(created) as created,
    MIN(ended) as ended
FROM chat
WHERE feedback_rating IS NOT NULL
    AND STATUS = 'ENDED'
    AND feedback_rating::int <= 5
    AND created BETWEEN :start::date AND :end::date
    AND EXISTS (
        SELECT 1
        FROM message
        WHERE message.chat_base_id = chat.base_id
            AND message.event IN (:events)
    )
GROUP BY chat.base_id
ORDER BY created DESC
