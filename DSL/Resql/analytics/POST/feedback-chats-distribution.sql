WITH chats_filtered AS (
    SELECT DISTINCT 
        base_id,
        first_value(created) OVER (
            PARTITION BY base_id
            ORDER BY updated
        ) AS created,
        last_value(feedback_rating) OVER (
            PARTITION BY base_id
            ORDER BY updated
        ) AS feedback_rating
    FROM chat
    WHERE STATUS = 'ENDED'
        AND feedback_rating IS NOT NULL
        AND created::date BETWEEN :start::date AND :end::date
        AND (
            (:chat_type = 'buerokratt' AND EXISTS (
                SELECT 1 
                FROM message 
                WHERE message.chat_base_id = chat.base_id 
                AND message.author_role = 'buerokratt'
            ))
            OR 
            (:chat_type = 'csa' AND customer_support_id <> ''
                AND EXISTS (
                    SELECT 1 
                    FROM message 
                    WHERE message.chat_base_id = chat.base_id 
                    AND message.author_role = 'backoffice-user'
                )
                AND EXISTS (
                    SELECT 1 
                    FROM message 
                    WHERE message.chat_base_id = chat.base_id 
                    AND message.author_role = 'end-user'
                )
            )
        )
)
SELECT 
    COUNT(CASE WHEN feedback_rating BETWEEN 9 AND 10 THEN 1 END) AS promoters,
    COUNT(CASE WHEN feedback_rating BETWEEN 7 AND 8 THEN 1 END) AS passives,
    COUNT(CASE WHEN feedback_rating BETWEEN 0 AND 6 THEN 1 END) AS detractors
FROM chats_filtered;
